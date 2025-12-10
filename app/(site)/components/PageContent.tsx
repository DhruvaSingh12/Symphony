"use client";

import React, { useState } from "react";
import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
import { Card } from "@/components/ui/card";
import AlbumModal from "@/components/AlbumModal";

interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [albumData, setAlbumData] = useState<{ songs: Song[] } | null>(null);

  const handleAlbumClick = (album: string) => {
    const filteredSongs = songs.filter((song) => song.album === album);
    setAlbumData({ songs: filteredSongs });
    setSelectedAlbum(album);
  };

  const closeAlbumModal = () => {
    setSelectedAlbum(null);
    setAlbumData(null);
  };

  return (
    <Card className="h-full p-4 relative">
      <div className="h-full overflow-auto scrollbar-hide">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 pb-4">
          {songs.map((item) => (
            <SongItem
              key={item.id}
              onClick={(id: string) => onPlay(Number(id))}
              onAlbumClick={handleAlbumClick}
              data={item}
            />
          ))}
        </div>
      </div>
      {selectedAlbum && albumData && (
        <AlbumModal
          album={selectedAlbum}
          albumData={albumData}
          onClose={closeAlbumModal}
        />
      )}
    </Card>
  );
};

export default PageContent;