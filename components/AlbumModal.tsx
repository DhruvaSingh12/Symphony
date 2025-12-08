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
import { Disc } from "lucide-react";

interface AlbumModalProps {
  album: string;
  albumData: { songs: Song[] };
  onClose: () => void;
}

const AlbumModal: React.FC<AlbumModalProps> = ({
  album,
  albumData,
  onClose,
}) => {
  const songCount = albumData.songs.length;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Disc className="h-5 w-5" />
            {album}
          </SheetTitle>
          <SheetDescription className="flex-1">
            {songCount} {songCount === 1 ? "song" : "songs"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-2">
            {albumData.songs.map((song) => (
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AlbumModal;
