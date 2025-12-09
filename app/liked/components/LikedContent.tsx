"use client";

import React, { useEffect } from "react";
import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import { Song } from "@/types";
import { useRouter } from "next/navigation";
import Table from '@/components/Table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

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
      <Card className="bg-card/60 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            No Liked Songs
          </CardTitle>
          <CardDescription>
            Songs you like will appear here. Start exploring and liking tracks!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Heart className="h-24 w-24 text-muted-foreground/20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Table songs={songs} onPlay={onPlay} />
  );
};

export default LikedContent;
