"use client";

import React from "react";
import { Song } from "@/types";
import useAuthModal from "@/hooks/ui/useAuthModal";
import useUploadModal from "@/hooks/ui/useUploadModal";
import useOnPlay from "@/hooks/data/useOnPlay";
import { useUser } from "@/hooks/auth/useUser";
import Table from "@/components/Table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInfiniteSongs } from "@/hooks/data/useInfiniteSongs";

interface UploadedContentProps {
  songs: Song[];
}

const UploadedContent: React.FC<UploadedContentProps> = ({
  songs: initialSongs,
}) => {
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const { user } = useUser();

  const { data, fetchNextPage, hasNextPage } =
    useInfiniteSongs("user_songs", initialSongs, 50, user?.id);

  const songs = React.useMemo(() => {
    return data?.pages.flatMap((page) => page) || initialSongs;
  }, [data?.pages, initialSongs]);

  const onPlay = useOnPlay(songs, "uploaded");

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
          <CardTitle>Your Uploads</CardTitle>
          <CardDescription>
            {songs.length === 0 && user
              ? "Songs you upload appear here."
              : "Please log in to view your uploads."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onClick}>
            <Plus className="mr-2 h-4 w-4" />
            {user ? "Upload Song" : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Table
      songs={songs}
      onPlay={onPlay}
      persistenceKey="uploaded-scroll"
      onLoadMore={() => {
        if (hasNextPage) fetchNextPage();
      }}
      hasMore={hasNextPage}
    />
  );
};

export default UploadedContent;
