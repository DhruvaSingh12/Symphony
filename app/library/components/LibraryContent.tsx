"use client";

import React, { useState, useEffect } from "react";
import { Song } from "@/types";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import Table from '@/components/Table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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

    if (songs.length === 0 || !user) {
        return (
            <Card className="bg-card/60 border-border">
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
        );
    }

    return (
        <Table songs={songs} onPlay={onPlay} />
    );
};

export default LibraryContent;
