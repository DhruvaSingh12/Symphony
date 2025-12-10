"use client";

import React from "react";
import { Song } from "@/types";
import SongRow from "./SongRow";
import useOnPlay from "@/hooks/useOnPlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const onPlay = useOnPlay(albumData.songs);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex text-lg items-center gap-2">
            {album}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="w-full h-[calc(100vh-8rem)] mt-4">
          <div className="flex flex-col">
            {albumData.songs.map((song, index) => (
              <div key={song.id} className="border-b border-border/50 last:border-b-0">
                <SongRow
                  song={song}
                  index={index}
                  onPlay={onPlay}
                  showAlbum={false}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AlbumModal;