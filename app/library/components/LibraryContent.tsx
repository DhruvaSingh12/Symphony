"use client";

import { useState, useEffect } from "react";
import { Song } from "@/types"; 
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";
import { useRouter } from "next/navigation";
import Table from '@/components/Table';

interface LibraryContentProps {
    songs: Song[];
}

const LibraryContent: React.FC<LibraryContentProps> = ({ songs: initialSongs }) => {
    const [songs] = useState<Song[]>(initialSongs);
    const authModal = useAuthModal();
    const uploadModal = useUploadModal();
    const { user, isLoading } = useUser();
    const onPlay = useOnPlay(songs);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
          router.replace("/");
        }
    }, [isLoading, user, router]);
    

    const onClick = () => {
        if (!user) {
            return authModal.onOpen();
        }
        return uploadModal.onOpen();
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-5 py-4">
                <div className="inline-flex items-center gap-x-2">
                    <TbPlaylist className="text-neutral-400" size={26} />
                </div>
                <div className="flex flex-row gap-x-2">
                    <h1 className="text-neutral-300">Add new songs</h1>
                    <AiOutlinePlus
                        onClick={onClick}
                        size={20}
                        className="text-neutral-400 hover:text-white cursor-pointer transition"
                    />
                </div>
            </div>
            {songs.length === 0 || !user ? (
                <div className="flex flex-col gap-y-2 mt-4 w-full px-6 text-neutral-400">
                    {songs.length === 0 && user ? 'Songs you add appear here.' : 'Please log in to view your library.'}
                </div>
            ) : (
                <Table songs={songs} onPlay={onPlay} />
            )}
        </div>
    );
};

export default LibraryContent;
