"use client";

import React from "react";
import { Song } from "@/types";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Music } from "lucide-react";

interface ArtistModalProps {
  artist: string;
  artistData: { songs: Song[]; albums: Set<string> };
  onClose: () => void;
}

const ArtistModal: React.FC<ArtistModalProps> = ({
  artist,
  artistData,
  onClose,
}) => {
  const songCount = artistData.songs.length;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="flex flex-col items-start">
          <SheetTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            {artist}
          </SheetTitle>
          <SheetDescription>
            {songCount} {songCount === 1 ? "song" : "songs"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {Array.from(artistData.albums).map((album) => (
            <div key={album} className="mb-2">
              <h3 className="text-base font-semibold mb-1">{album}</h3>
              <Separator className="mb-1" />
              <div className="space-y-1">
                {artistData.songs
                  .filter((song) => song.album === album)
                  .map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-0 rounded-lg"
                    >
                      <div className="flex-1">
                        <MediaItem data={song} onClick={() => {}} />
                      </div>
                      <LikeButton songId={song.id} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ArtistModal;
