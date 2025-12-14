"use client";

import { useState, useMemo } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import uniqid from 'uniqid';
import { useRouter } from 'next/navigation';

import { useUser } from '@/hooks/useUser';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useAllSongs } from '@/hooks/queries/useAllSongs';

import Button from '@/components/Button';
import MetadataForm from './MetadataForm';
import FileSection from './FileSection';
import PreviewSection from './PreviewSection';
import { processImage, processAudio } from '@/lib/mediaUtils';

const UploadForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { data: allSongs } = useAllSongs();

    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Get unique existing artists and albums
    const { uniqueArtists, uniqueAlbums } = useMemo(() => {
        const artists = new Set<string>();
        const albums = new Set<string>();

        allSongs?.forEach(song => {
            song.artist?.forEach(a => artists.add(a));
            if (song.album) albums.add(song.album);
        });

        return {
            uniqueArtists: Array.from(artists).sort(),
            uniqueAlbums: Array.from(albums).sort()
        };
    }, [allSongs]);

    const { register, handleSubmit, reset, watch, setValue } = useForm<FieldValues>({
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
                // FALLBACK: Use original file
                toast.error("Audio optimization failed. Uploading original file instead.", { id: 'process-audio', duration: 4000 });
                finalSongFile = rawSongFile;
            }

            const uniqueID = uniqid();

            // Extract duration from the processed file
            let songDuration: number | null = null;
            try {
                songDuration = await new Promise<number>((resolve, reject) => {
                    const audio = new Audio();
                    audio.preload = 'metadata';
                    audio.onloadedmetadata = () => {
                        window.URL.revokeObjectURL(audio.src);
                        const duration = Math.floor(audio.duration);
                        if (isNaN(duration) || duration === 0) resolve(0); // Fallback
                        else resolve(duration);
                    };
                    audio.onerror = () => {
                        window.URL.revokeObjectURL(audio.src);
                        console.warn("Audio metadata load error");
                        resolve(0);
                    };
                    audio.src = URL.createObjectURL(finalSongFile);
                });
            } catch (error) {
                console.warn('Could not extract duration:', error);
            }

            // Upload Song (Use finalSongFile)
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

            // Upload Image (Use finalImageFile)
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
            } // Continue...

            // Insert Record
            const { error: supabaseError } = await supabaseClient
                .from('songs')
                .insert({
                    title: values.title,
                    album: selectedAlbum,
                    artist: selectedArtists,
                    image_path: imageData.path,
                    song_path: songData.path,
                    user_id: user.id,
                    duration: songDuration
                });

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.push('/library');
            router.refresh();
            toast.success('Track uploaded successfully');
            reset();
            setSelectedArtists([]);
            setSelectedAlbum("");

        } catch {
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
                    uniqueArtists={uniqueArtists}
                    uniqueAlbums={uniqueAlbums}
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
            <div className="lg:col-span-4">
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
