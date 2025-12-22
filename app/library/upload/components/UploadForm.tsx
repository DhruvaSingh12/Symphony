"use client";

import { useState, useMemo } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import uniqid from 'uniqid';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/auth/useUser';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { getOrCreateArtist, getOrCreateAlbum } from '@/lib/api/songs';
import { useArtists } from '@/hooks/queries/useArtists';
import { useAlbums } from '@/hooks/queries/useAlbums';
import Button from '@/components/Button';
import MetadataForm from './MetadataForm';
import FileSection from './FileSection';
import PreviewSection from './PreviewSection';
import { processImage, processAudio } from '@/lib/mediaUtils';
import { Artist, Album } from '@/types';

const UploadForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const { data: artistsData } = useArtists();
    const { data: albumsData } = useAlbums();

    const [selectedArtists, setSelectedArtists] = useState<(Artist | { name: string })[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | { title: string } | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { register, handleSubmit, reset, watch } = useForm<FieldValues>({
        defaultValues: {
            title: '',
            song: null,
            image: null
        }
    });

    const imageFile = watch('image');
    const title = watch('title');

    // Update image preview when file changes
    useMemo(() => {
        if (imageFile && imageFile[0]) {
            const url = URL.createObjectURL(imageFile[0]);
            setImagePreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const rawImageFile = values.image?.[0];
            const rawSongFile = values.song?.[0];

            if (!rawImageFile || !rawSongFile || !user) {
                toast.error('Missing fields');
                return;
            }

            if (selectedArtists.length === 0) {
                toast.error('Please select at least one artist');
                setIsLoading(false);
                return;
            }

            if (!selectedAlbum) {
                toast.error('Please select or create an album');
                setIsLoading(false);
                return;
            }

            const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
            const MAX_SONG_SIZE = 50 * 1024 * 1024; // 50MB

            if (rawImageFile.size > MAX_IMAGE_SIZE) {
                toast.error('Image file too large (Max 5MB)');
                setIsLoading(false);
                return;
            }

            if (rawSongFile.size > MAX_SONG_SIZE) {
                toast.error('Audio file too large (Max 50MB)');
                setIsLoading(false);
                return;
            }

            // 1. Process Image
            let finalImageFile: File;
            try {
                toast.loading('Compressing image...', { id: 'process-image' });
                finalImageFile = await processImage(rawImageFile);
                toast.success('Image compressed!', { id: 'process-image' });
            } catch (error) {
                console.error("Image processing error:", error);
                toast.error("Failed to process image", { id: 'process-image' });
                setIsLoading(false);
                return;
            }

            // 2. Process Audio
            let finalSongFile: File;
            try {
                toast.loading('Converting audio (this may take a while)', { id: 'process-audio' });
                finalSongFile = await processAudio(rawSongFile);
                toast.success('Audio converted!', { id: 'process-audio' });
            } catch (error) {
                console.error("Audio processing error:", error);
                toast.error("Audio optimization failed. Uploading original file instead.", { id: 'process-audio', duration: 4000 });
                finalSongFile = rawSongFile;
            }

            const uniqueID = uniqid();

            // Extract duration
            let songDuration: number | null = null;
            try {
                songDuration = await new Promise<number>((resolve) => {
                    const audio = new Audio();
                    audio.preload = 'metadata';
                    audio.onloadedmetadata = () => {
                        window.URL.revokeObjectURL(audio.src);
                        const duration = Math.floor(audio.duration);
                        resolve(isNaN(duration) || duration === 0 ? 0 : duration);
                    };
                    audio.onerror = () => {
                        window.URL.revokeObjectURL(audio.src);
                        resolve(0);
                    };
                    audio.src = URL.createObjectURL(finalSongFile);
                });
            } catch (error) {
                console.warn('Could not extract duration:', error);
            }

            // 3. Resolve Metadata (Artists & Album)
            toast.loading('Resolving metadata...', { id: 'resolve-metadata' });

            // Resolve Album
            let albumId: number | null = null;
            if ('id' in selectedAlbum) {
                albumId = selectedAlbum.id;
            } else {
                const album = await getOrCreateAlbum(selectedAlbum.title, supabaseClient);
                if (!album) {
                    toast.error('Failed to create album', { id: 'resolve-metadata' });
                    setIsLoading(false);
                    return;
                }
                albumId = album.id;
            }

            // Resolve Artists
            const resolvedArtistIds: number[] = [];
            for (const artist of selectedArtists) {
                if ('id' in artist) {
                    resolvedArtistIds.push(artist.id);
                } else {
                    const createdArtist = await getOrCreateArtist(artist.name, supabaseClient);
                    if (!createdArtist) {
                        toast.error(`Failed to create artist: ${artist.name}`, { id: 'resolve-metadata' });
                        setIsLoading(false);
                        return;
                    }
                    resolvedArtistIds.push(createdArtist.id);
                }
            }
            toast.success('Metadata resolved!', { id: 'resolve-metadata' });

            // 4. Upload Files
            // Upload Song
            const { data: songData, error: songError } = await supabaseClient
                .storage
                .from('songs')
                .upload(`song-${values.title}-${uniqueID}`, finalSongFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (songError) {
                setIsLoading(false);
                return toast.error(`Song upload failed: ${songError.message}`);
            }

            // Upload Image
            const { data: imageData, error: imageError } = await supabaseClient
                .storage
                .from('images')
                .upload(`image-${values.title}-${uniqueID}`, finalImageFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (imageError) {
                setIsLoading(false);
                return toast.error(`Image upload failed: ${imageError.message}`);
            }

            // 5. Insert Record
            const { data: insertedSong, error: supabaseError } = await supabaseClient
                .from('songs')
                .insert({
                    title: values.title,
                    album_id: albumId,
                    image_path: imageData.path,
                    song_path: songData.path,
                    user_id: user.id,
                    duration: songDuration
                })
                .select()
                .single();

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            // 6. Insert Junction Records (song_artists)
            const songArtistRecords = resolvedArtistIds.map(artistId => ({
                song_id: insertedSong.id,
                artist_id: artistId
            }));

            const { error: junctionError } = await supabaseClient
                .from('song_artists')
                .insert(songArtistRecords);

            if (junctionError) {
                console.error("Junction error:", junctionError);
                toast.error("Failed to link artists to song");
                // Note: Song still uploaded, but artists might be missing.
            }

            router.push('/library');
            router.refresh();
            toast.success('Track uploaded successfully');
            reset();
            setSelectedArtists([]);
            setSelectedAlbum(null);

        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            <div className="md:col-span-8 space-y-4">
                <MetadataForm
                    register={register}
                    isLoading={isLoading}
                    selectedArtists={selectedArtists}
                    setSelectedArtists={setSelectedArtists}
                    selectedAlbum={selectedAlbum}
                    setSelectedAlbum={setSelectedAlbum}
                    uniqueArtists={artistsData || []}
                    uniqueAlbums={albumsData || []}
                />
                <FileSection
                    register={register}
                    isLoading={isLoading}
                />
                <div className="pt-2 items-center justify-center flex">
                    <Button
                        disabled={isLoading}
                        type="submit"
                        className="max-w-md h-12 text-lg font-semibold bg-foreground hover:bg-foreground/80 text-background transition transform active:scale-[0.99]"
                    >
                        {isLoading ? "Uploading..." : "Upload Track"}
                    </Button>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="col-span-2 md:col-span-3 lg:col-span-4">
                <PreviewSection
                    title={title}
                    artists={selectedArtists}
                    album={selectedAlbum}
                    imagePreview={imagePreview}
                />
            </div>
        </form>
    );
};

export default UploadForm;