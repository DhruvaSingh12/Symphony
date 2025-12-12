"use client";

import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import LikedContent from "./components/LikedContent";
import { useLikedSongs } from "@/hooks/queries/useLikedSongs";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import useOnPlay from "@/hooks/useOnPlay";

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";

const LikedPage = () => {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useUser();
  const { data: songs, isLoading: isLoadingSongs, error } = useLikedSongs();
  const onPlay = useOnPlay(songs || []);

  const isLoading = isLoadingSongs || isLoadingUser;

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace("/");
    }
  }, [isLoadingUser, user, router]);

  if (isLoadingUser || (!user && !isLoadingUser)) {
    return (
      <Box className="flex h-full w-full scrollbar-hide items-center justify-center">
        <BounceLoader className="text-foreground" size={40} />
      </Box>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
        <Header className="bg-transparent">
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-start flex-col gap-1">
              <h1 className="text-3xl font-semibold text-foreground">
                Liked Songs
              </h1>
              {!isLoading && songs && (
                <div>
                  {songs.length} {songs.length === 1 ? "song" : "songs"}
                </div>
              )}
            </div>
            {!isLoading && songs && songs.length > 0 && (
              <Button
                onClick={() => onPlay(songs[0].id)}
                size="icon"
                className="rounded-full bg-foreground hover:bg-primary/90 transition w-10 h-10 md:w-12 md:h-12"
              >
                <Play className="text-background fill-background w-8 h-8 md:w-12 md:h-12" />
              </Button>
            )}
          </div>
        </Header>
      </div>
      <div className="flex-1 overflow-hidden px-2 md:px-0 md:pr-2 mt-2 pb-2">
        {isLoading ? (
          <Box className="flex h-full w-full scrollbar-hide items-center justify-center">
            <BounceLoader className="text-foreground" size={40} />
          </Box>
        ) : error ? (
          <Card className="bg-card/60 border-border">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Error loading liked songs. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : (
          <LikedContent songs={songs || []} />
        )}
      </div>
    </div>
  );
};

export default LikedPage;