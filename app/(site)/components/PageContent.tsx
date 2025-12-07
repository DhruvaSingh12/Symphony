"use client";

import React from 'react';
import SongItem from '@/components/SongItem';
import useOnPlay from '@/hooks/useOnPlay';
import { Song } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs);

  if (songs.length === 0) {
    return (
      <Card className="bg-card/40 border-border">
        <CardHeader>
          <CardTitle>No songs available</CardTitle>
          <CardDescription>Start by uploading your first track!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="
      grid
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-8
      gap-4
      mt-4
    ">
      {songs.map((item) => (
        <SongItem
          key={item.id}
          onClick={(id: string) => onPlay(id)}
          data={item}
        />
      ))}
    </div>
  );
};

export default PageContent;
