"use client";

import { useEffect, useState, useRef } from 'react';
import { BatchItem } from './BatchUploadForm';
import { Trash2, Music, User, Disc, Quote, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { processAudio, processImage, sanitizePath } from '@/lib/mediaUtils';
import { extractMetadata, metadataImageToFile } from '@/lib/metadata';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useUser } from '@/hooks/auth/useUser';
import { getOrCreateArtist, getOrCreateAlbum } from '@/lib/api/songs';
import uniqid from 'uniqid';
import { cn } from '@/lib/utils';

interface UploadItemProps {
    item: BatchItem;
    onRemove: () => void;
    onUpdate: (updates: Partial<BatchItem>) => void;
    isUploading: boolean;
    shouldStart: boolean;
    onComplete: (success: boolean) => void;
}

const UploadItem = ({
    item,
    onRemove,
    onUpdate,
    isUploading,
    shouldStart,
    onComplete
}: UploadItemProps) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
    const startedUpload = useRef(false);

    // Initial metadata extraction for image
    useEffect(() => {
        const loadImg = async () => {
            if (item.image) return;

            const meta = await extractMetadata(item.file);
            if (meta.image) {
                const imageFile = metadataImageToFile(meta.image.data, meta.image.format, `art-${item.id}`);
                onUpdate({ image: imageFile });
                setImagePreview(URL.createObjectURL(imageFile));
            }
        };
        loadImg();
    }, []);

    // Handle manual image change
    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate({ image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // The actual upload logic triggered by status change from parent
    useEffect(() => {
        if (shouldStart && item.status === 'idle' && !startedUpload.current) {
            startedUpload.current = true;
            performUpload();
        }
    }, [shouldStart, item.status]);

    const performUpload = async () => {
        try {
            if (!user) throw new Error("Not authenticated");

            // 1. Process Audio
            onUpdate({ status: 'processing' });
            let finalAudioFile: File;
            try {
                finalAudioFile = await processAudio(item.file, item.duration);
            } catch (err) {
                console.warn("Processing failed, using original:", err);
                finalAudioFile = item.file;
            }

            // 2. Process Image (if exists)
            onUpdate({ status: 'uploading' });
            let finalImageFile: File | null = null;
            if (item.image instanceof File) {
                finalImageFile = await processImage(item.image);
            }

            // 3. Resolve Metadata
            const artistIds: number[] = [];
            for (const name of item.artists) {
                const artist = await getOrCreateArtist(name, supabaseClient);
                if (artist) artistIds.push(artist.id);
            }

            const album = await getOrCreateAlbum(item.album, supabaseClient);
            const albumId = album?.id || null;

            // 4. Upload Files
            const uniqueID = uniqid();
            const safeTitle = sanitizePath(item.title);

            // Upload Audio
            const { data: audioData, error: audioError } = await supabaseClient.storage
                .from('songs')
                .upload(`song-${safeTitle}-${uniqueID}.${finalAudioFile.name.split('.').pop()}`, finalAudioFile);

            if (audioError) throw audioError;

            // Upload Image (optional)
            let imagePath = null;
            if (finalImageFile) {
                const { data: imageData, error: imageError } = await supabaseClient.storage
                    .from('images')
                    .upload(`image-${safeTitle}-${uniqueID}.${finalImageFile.name.split('.').pop()}`, finalImageFile);
                if (!imageError) imagePath = imageData.path;
            }

            // Upload Lyrics (optional)
            let lyricsPath = null;
            if (item.lyricsFile) {
                const { data: lyData, error: lyError } = await supabaseClient.storage
                    .from('lyrics')
                    .upload(`lyrics-${safeTitle}-${uniqueID}.lrc`, item.lyricsFile);
                if (!lyError) lyricsPath = lyData.path;
            }

            // 5. Insert Database Record
            const { data: song, error: dbError } = await supabaseClient
                .from('songs')
                .insert({
                    title: item.title,
                    user_id: user.id,
                    song_path: audioData.path,
                    image_path: imagePath,
                    lyrics_path: lyricsPath,
                    album_id: albumId,
                    duration: Math.round(item.duration)
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // 6. Link Artists
            if (artistIds.length > 0) {
                await supabaseClient.from('song_artists').insert(
                    artistIds.map(id => ({ song_id: song.id, artist_id: id }))
                );
            }

            onUpdate({ status: 'completed' });
            onComplete(true);
        } catch (error: any) {
            console.error(error);
            onUpdate({ status: 'error' });
            onComplete(false);
        }
    };

    return (
        <div className={cn(`
            group relative flex flex-col md:flex-row gap-6 p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm transition-all duration-300
            ${item.status === 'completed' ? 'opacity-60 border-primary/20 bg-primary/[0.02]' : 'hover:bg-card/60 hover:border-border'}
            ${item.status === 'error' ? 'border-destructive/50 bg-destructive/[0.02]' : ''}
            ${shouldStart ? 'ring-2 ring-primary/40 scale-[1.01] shadow-2xl shadow-primary/10' : ''}
        `)}>
            {/* Status Progress Bar (Simulated) */}
            {shouldStart && item.status !== 'completed' && (
                <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full overflow-hidden rounded-t-2xl">
                    <div className="h-full bg-primary animate-progress-indeterminate w-[30%] shadow-[0_0_10px_rgb(var(--primary))]" />
                </div>
            )}

            {/* Artwork Section */}
            <div className="relative flex-none w-28 h-28 md:w-32 md:h-32 self-center md:self-start">
                <label className="cursor-pointer group/img block w-full h-full rounded-2xl overflow-hidden border border-border/40 bg-muted/30 shadow-inner group-hover:border-primary/40 transition-colors">
                    {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover/img:scale-110 duration-500" alt="Art" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                            <ImageIcon size={32} strokeWidth={1.5} />
                            <span className="text-[10px] uppercase mt-2 font-bold tracking-widest">Artwork</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase tracking-tighter">
                        <UploadCloud size={20} className="mb-1" />
                        Replace
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={onImageChange} disabled={isUploading} />
                </label>
            </div>

            {/* Editing Section */}
            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2 px-1">
                            <Music size={10} className="text-primary" /> Title
                        </label>
                        <Input
                            value={item.title}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            className="h-10 text-sm bg-background/50 border-border/40 focus:bg-background transition-all rounded-xl"
                            placeholder="Track Title"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2 px-1">
                            <User size={10} className="text-primary" /> Artists
                        </label>
                        <Input
                            value={item.artists.join('; ')}
                            onChange={(e) => onUpdate({ artists: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                            className="h-10 text-sm bg-background/50 border-border/40 focus:bg-background transition-all rounded-xl"
                            placeholder="Artist 1; Artist 2"
                            disabled={isUploading}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2 px-1">
                            <Disc size={10} className="text-primary" /> Album
                        </label>
                        <Input
                            value={item.album}
                            onChange={(e) => onUpdate({ album: e.target.value })}
                            className="h-10 text-sm bg-background/50 border-border/40 focus:bg-background transition-all rounded-xl"
                            placeholder="Album Title"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-3">
                        {item.lyricsFile ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-tighter shadow-sm">
                                <Quote size={10} /> Sync Lyrics
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="opacity-30 gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-tighter">
                                No Lyrics
                            </Badge>
                        )}

                        <div className="ml-auto">
                            {item.status === 'processing' && (
                                <Badge className="bg-amber-500 hover:bg-amber-500 gap-1.5 px-4 rounded-full font-bold py-1 animate-pulse">
                                    <Loader2 size={12} className="animate-spin" /> Processing
                                </Badge>
                            )}
                            {item.status === 'uploading' && (
                                <Badge className="bg-blue-500 hover:bg-blue-500 gap-1.5 px-4 rounded-full font-bold py-1">
                                    <UploadCloud size={12} className="animate-bounce" /> Uploading
                                </Badge>
                            )}
                            {item.status === 'completed' && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-500 gap-1.5 px-4 rounded-full font-bold py-1 shadow-md shadow-emerald-500/20">
                                    <CheckCircle2 size={12} /> Ready
                                </Badge>
                            )}
                            {item.status === 'error' && (
                                <Badge variant="destructive" className="gap-1.5 px-4 rounded-full font-bold py-1">
                                    <AlertCircle size={12} /> Error
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!isUploading && item.status === 'idle' && (
                <button
                    onClick={onRemove}
                    className="absolute top-4 right-4 p-2.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
};

export default UploadItem;
