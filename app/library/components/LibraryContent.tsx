"use client";

import { useState, useEffect } from "react";
import { Song } from "@/types";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import { ListMusic, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Table from '@/components/Table';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-x-2">
                    <ListMusic className="text-muted-foreground" size={26} />
                </div>
                <Button variant="ghost" onClick={onClick} className="gap-x-2">
                    <span className="text-muted-foreground">Add new songs</span>
                    <Plus size={20} className="text-muted-foreground" />
                </Button>
            </div>
            {songs.length === 0 || !user ? (
                <Card className="bg-card/40 border-border">
                    <CardHeader>
                        <CardTitle>Your Library</CardTitle>
                        <CardDescription>
                            {songs.length === 0 && user ? 'Songs you add appear here.' : 'Please log in to view your library.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={onClick}>
                            <Plus className="mr-2 h-4 w-4" />
                            {user ? 'Upload Song' : 'Sign In'}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Table songs={songs} onPlay={onPlay} />
            )}
        </div>
    );
};

export default LibraryContent;
