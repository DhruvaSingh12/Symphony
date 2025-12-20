"use client";

import React, { useEffect } from "react";
import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
import { Card } from "@/components/ui/card";
import { useInfiniteSongs } from "@/hooks/useInfiniteSongs";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import useAuthModal from "@/hooks/useAuthModal";
import { useSearchParams } from "next/navigation";

interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs: initialSongs }) => {
  const authModal = useAuthModal();
  const searchParams = useSearchParams();

  useEffect(() => {
    const shouldOpenAuth = searchParams.get('auth') === 'true';
    if (shouldOpenAuth) {
      authModal.onOpen();
    }
  }, [searchParams, authModal]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSongs('songs', initialSongs, 50);

  const songs = React.useMemo(() => {
    return data?.pages.flatMap((page) => page) || initialSongs;
  }, [data?.pages, initialSongs]);

  const onPlay = useOnPlay(songs, 'home');

  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (songs.length === 0) {
    return (
      <div className="mt-4 text-muted-foreground">
        No songs available.
      </div>
    );
  }

  return (
    <Card className="h-full p-4 relative">
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
        {hasNextPage && (
          <div ref={ref} className="flex justify-center p-4 w-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PageContent;