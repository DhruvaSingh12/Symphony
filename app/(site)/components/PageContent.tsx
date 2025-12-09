"use client";

import React from "react";
import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs)
  return (
    <div>
      <ScrollArea className="h-[calc(77vh)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 pb-12">
          {songs.map((item) => (
            <SongItem
              key={item.id}
              onClick={(id: string) => onPlay(Number(id))}
              data={item}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PageContent;