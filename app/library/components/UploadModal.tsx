"use client";

import useUploadModal from '@/hooks/useUploadModal';
import Modal from '@/components/Modal';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@/hooks/useUser';
import uniqid from 'uniqid';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Input from '@/app/search/components/Input';
import Button from '@/components/Button';

const UploadModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [artists, setArtists] = useState(['']);
    const uploadModal = useUploadModal();
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const { register, handleSubmit, reset } = useForm<FieldValues>({
        defaultValues: {
            title: '',
            album: '',
            song: null,
            image: null
        }
    });

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            setArtists(['']); 
            uploadModal.onClose();
        }
    };

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const imageFile = values.image?.[0];
            const songFile = values.song?.[0];

            if (!imageFile || !songFile || !user) {
                toast.error('Missing fields');
                return;
            }

            const uniqueID = uniqid();

            const { data: songData, error: songError } = await supabaseClient
                .storage
                .from('songs')
                .upload(`song-${values.title}-${uniqueID}`, songFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (songError) {
                setIsLoading(false);
                return toast.error("Failed to upload song file.");
            }

            const { data: imageData, error: imageError } = await supabaseClient
                .storage
                .from('images')
                .upload(`image-${values.title}-${uniqueID}`, imageFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (imageError) {
                setIsLoading(false);
                return toast.error("Failed to upload cover file.");
            }

            const { error: supabaseError } = await supabaseClient
                .from('songs')
                .insert({
                    title: values.title,
                    album: values.album,
                    artist: artists,
                    image_path: imageData.path,
                    song_path: songData.path,
                    user_id: user.id
                });

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success('Song uploaded successfully');
            reset();
            setArtists(['']); 
            uploadModal.onClose();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const addArtistField = () => {
        setArtists([...artists, '']);
    };

    const removeArtistField = (index: number) => {
        if (artists.length > 1) {
            const newArtists = artists.filter((_, i) => i !== index);
            setArtists(newArtists);
        }
    };

    const updateArtist = (index: number, value: string) => {
        const newArtists = [...artists];
        newArtists[index] = value;
        setArtists(newArtists);
    };

    return (
        <Modal
            title="Add a song"
            description="Upload an mp3 file"
            isOpen={uploadModal.isOpen}
            onChange={onChange}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-y-4'
            >
                <Input
                    id="title"
                    disabled={isLoading}
                    {...register('title', { required: true })}
                    placeholder="Song Title"
                />
                <Input
                    id="album"
                    disabled={isLoading}
                    {...register('album', { required: true })}
                    placeholder="Album Name"
                />
                <div>
                    <div className='pb-1 flex items-center'>
                        <span className="font-semibold">Song Artists</span>
                        <button 
                            type="button" 
                            onClick={addArtistField} 
                            className="ml-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition"
                        >
                            +
                        </button>
                    </div>
                    {artists.map((artist, index) => (
                        <div key={index} className="flex items-center gap-x-2 mt-2">
                            <Input
                                id={`artist-${index}`}
                                disabled={isLoading}
                                value={artist}
                                onChange={(e) => updateArtist(index, e.target.value)}
                                placeholder={`Artist ${index + 1}`}
                            />
                            {artists.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeArtistField(index)} 
                                    className="text-white hover:text-purple-500 text-xl transition"
                                >
                                    x
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div>
                    <div className='pb-1 font-semibold'>
                        Select a song file
                    </div>
                    <Input
                        id="song"
                        type="file"
                        disabled={isLoading}
                        accept=".mp3"
                        {...register('song', { required: true })}
                    />
                </div>
                <div>
                    <div className='pb-1 font-semibold'>
                        Select song cover
                    </div>
                    <Input
                        id="image"
                        type="file"
                        disabled={isLoading}
                        accept="image/*"
                        {...register('image', { required: true })}
                    />
                </div>
                <Button disabled={isLoading} type="submit">
                    Upload
                </Button>
            </form>
        </Modal>
    );
}

export default UploadModal;
