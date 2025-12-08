"use client";

import Header from "@/components/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Sort from "@/components/Sort";
import LikedContent from "./components/LikedContent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLikedSongs } from "@/hooks/queries/useLikedSongs";
import { Skeleton } from "@/components/ui/skeleton";

const LikedPage = () => {
  const { data: songs, isLoading, error } = useLikedSongs();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
        <Header className="bg-transparent">
          <div className="px-2">
            <div className="flex items-center gap-x-5">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
                <AvatarImage src="/images/liked.jpg" alt="Liked Songs" />
                <AvatarFallback>♥</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                  Liked Songs
                </h1>
                {!isLoading && songs && (
                  <p className="text-muted-foreground text-sm md:text-base">
                    {songs.length} songs
                  </p>
                )}
              </div>
            </div>
          </div>
        </Header>
      </div>
      <div className="flex-1 overflow-hidden px-2 md:px-0 md:pr-2 pb-2">
        <Card className="bg-card/60 border-border h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : error ? (
                  <p className="text-center text-muted-foreground">
                    Error loading liked songs. Please try again.
                  </p>
                ) : (
                  <Sort songs={songs || []} ContentComponent={LikedContent} />
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LikedPage;
