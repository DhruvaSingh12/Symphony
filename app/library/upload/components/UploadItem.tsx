"use client";

import { useEffect, useState, useRef } from 'react';
import { BatchItem } from './BatchUploadForm';
import { Trash2, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { processAudio, processImage, sanitizePath } from '@/lib/mediaUtils';
import { extractMetadata, metadataImageToFile } from '@/lib/metadata';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useUser } from '@/hooks/auth/useUser';
import { getOrCreateArtist, getOrCreateAlbum } from '@/lib/api/songs';
import uniqid from 'uniqid';
import { cn } from '@/lib/utils';
import { FaCloudArrowUp } from 'react-icons/fa6';

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
            group relative flex flex-col md:flex-row gap-5 p-4 rounded-xl border border-border bg-card backdrop-blur-md transition-all duration-500
            ${item.status === 'completed' ? 'opacity-80 border-primary/10' : 'hover:bg-card/50 hover:border-border/80'}
            ${item.status === 'error' ? 'border-destructive/40 bg-destructive/5' : ''}
            ${shouldStart && item.status !== 'completed' ? 'ring-1 ring-primary/20 bg-card/60' : ''}
        `)}>
            {/* Minimal Progress Line */}
            {shouldStart && item.status !== 'completed' && (
                <div className="absolute top-1 px-2 left-0 h-1 bg-primary/10 w-full overflow-hidden rounded-t-3xl">
                    <div className="h-full bg-primary animate-progress-indeterminate w-[90%] shadow-[0_0_15px_rgba(var(--primary),0.5)] rounded-full" />
                </div>
            )}

            {/* Artwork  */}
            <div className="relative flex-none w-24 h-24 md:w-28 md:h-28 self-center md:self-start">
                <label className="cursor-pointer group/img block w-full h-full rounded-xl overflow-hidden border border-border/30 bg-muted/20 hover:border-primary/30 transition-all duration-500 shadow-sm">
                    {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Art" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
                            <ImageIcon size={24} strokeWidth={1} />
                        </div>
                    )}
                    <div className="absolute rounded-xl inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-foreground font-bold text-[9px] uppercase tracking-[0.2em]">
                        <UploadCloud size={16} className="mb-1 opacity-60" />
                        Update
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={onImageChange} disabled={isUploading} />
                </label>
            </div>

            {/* Editing Section */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em] px-1 flex items-center">
                            Title
                        </label>
                        <Input
                            value={item.title}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            className="h-9 text-xs bg-background/30 border-border focus:bg-background/60 focus:border-primary/20 transition-all rounded-lg placeholder:text-muted-foreground/30"
                            placeholder="Track Title"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em] px-1 flex items-center">
                            Artist
                        </label>
                        <Input
                            value={item.artists.join('; ')}
                            onChange={(e) => onUpdate({ artists: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                            className="h-9 text-xs bg-background/30 border-border focus:bg-background/60 focus:border-primary/20 transition-all rounded-lg placeholder:text-muted-foreground/30"
                            placeholder="Artist 1; Artist 2"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em] px-1 flex items-center">
                            Album
                        </label>
                        <Input
                            value={item.album}
                            onChange={(e) => onUpdate({ album: e.target.value })}
                            className="h-9 text-xs bg-background/30 border-border focus:bg-background/60 focus:border-primary/20 transition-all rounded-lg placeholder:text-muted-foreground/30"
                            placeholder="Album Title"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Status & Lyrics Row */}
                    <div className="flex items-end justify-between gap-3 h-9 mb-0.5">
                        <div className="flex items-center gap-2">
                            {item.lyricsFile ? (
                                <div className="flex items-center px-2.5 py-1 rounded-md bg-primary/5 text-primary border border-primary/10 font-bold text-[9px] uppercase tracking-widest">
                                    Lyrics Synced
                                </div>
                            ) : (
                                <div className="text-[9px] text-muted-foreground/30 uppercase font-bold tracking-widest px-1">
                                    No Lyrics
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {item.status === 'processing' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-secondary-foreground font-bold text-[9px] uppercase tracking-widest animate-pulse">
                                    <Loader2 size={10} className="animate-spin" /> Processing
                                </div>
                            )}
                            {item.status === 'uploading' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground font-bold text-[9px] uppercase tracking-widest">
                                    <FaCloudArrowUp size={10} className="animate-bounce" /> In Jest
                                </div>
                            )}
                            {item.status === 'completed' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground font-bold text-[9px] uppercase tracking-widest opacity-60">
                                    <CheckCircle2 size={10} /> Uploaded
                                </div>
                            )}
                            {item.status === 'error' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-destructive text-destructive-foreground font-bold text-[9px] uppercase tracking-widest">
                                    <AlertCircle size={10} /> Failure
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Remove Action */}
            {!isUploading && item.status === 'idle' && (
                <button
                    onClick={onRemove}
                    className="absolute top-1.5 right-1.5 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 duration-300"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
};

export default UploadItem;