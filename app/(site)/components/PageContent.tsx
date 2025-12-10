"use client";

import React from "react";
import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
import { Card } from "@/components/ui/card";

interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs)
  return (
    <Card className="h-full p-4">
      <div className="h-full overflow-auto scrollbar-hide">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 pb-4">
          {songs.map((item) => (
            <SongItem
              key={item.id}
              onClick={(id: string) => onPlay(Number(id))}
              data={item}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PageContent;