"use client";

import React, { useEffect } from "react";
import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import { Song } from "@/types";
import { useRouter } from "next/navigation";
import Table from '@/components/Table';
import { Heart } from "lucide-react";
import Box from "@/components/Box";

interface LikedContentProps {
  songs: Song[];
}

const LikedContent: React.FC<LikedContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs);
  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (songs.length === 0) {
    return (
      <Box className="flex border border-border flex-col h-full w-full items-center justify-center gap-4">
        <Heart className="h-16 w-16 text-muted-foreground/40" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Liked Songs Yet
          </h2>
          <p className="text-muted-foreground">
            Start liking songs to see them here
          </p>
        </div>
      </Box>
    );
  }

  return (
    <Table songs={songs} onPlay={onPlay} persistenceKey="liked-scroll" />
  );
};

export default LikedContent