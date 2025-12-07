"use client";

import React from 'react';
import { Song } from '@/types';
import MediaItem from './MediaItem';
import LikeButton from './LikeButton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Music } from 'lucide-react';

interface ArtistModalProps {
  artist: string;
  artistData: { songs: Song[]; albums: Set<string> };
  onClose: () => void;
}

const ArtistModal: React.FC<ArtistModalProps> = ({ artist, artistData, onClose }) => {
  const songCount = artistData.songs.length;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            {artist}
          </SheetTitle>
          <SheetDescription>
            <Badge variant="secondary">
              {songCount} {songCount === 1 ? 'song' : 'songs'}
            </Badge>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {Array.from(artistData.albums).map((album) => (
            <div key={album} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{album}</h3>
              <Separator className="mb-2" />
              <div className="space-y-2">
                {artistData.songs
                  .filter((song) => song.album === album)
                  .map((song) => (
                    <div key={song.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50">
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
