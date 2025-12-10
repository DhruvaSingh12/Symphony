"use client";

import Header from '@/components/Header';
import PageContent from './components/PageContent';
import { useAllSongs } from '@/hooks/queries/useAllSongs';
import usePlayer from '@/hooks/usePlayer';

export default function Home() {
  const { data: songs, error } = useAllSongs();
  const player = usePlayer();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
        <Header className="bg-transparent">
          <div className="px-1">
            <h1 className="text-3xl font-semibold text-foreground">
              Welcome Listener
            </h1>
          </div>
        </Header>
      </div>
      <div className="flex-1 overflow-hidden mt-2 px-2 md:px-0 md:pr-2 pb-2">
        {error ? (
          <div className="p-4">
            <p className="text-center text-muted-foreground">
              Error loading songs. Please try again.
            </p>
          </div>
        ) : (
          <PageContent songs={songs || []} />
        )}
      </div>
    </div>
  );
}