"use client";

import { useState, useMemo } from "react";
import { ArtistInfo } from "@/lib/api/songs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Disc } from "lucide-react";
import { useRouter } from "next/navigation";
import ArtistControls, { SortOption } from "./ArtistControls";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSongsByArtist } from "@/lib/api/songs";

interface ArtistContentProps {
  artists: ArtistInfo[];
}

const ArtistContent: React.FC<ArtistContentProps> = ({ artists }) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("lastUpdated");
  const router = useRouter();
  const queryClient = useQueryClient();

  const processedArtists = useMemo(() => {
    // First, deduplicate artists by name
    const uniqueArtists = Array.from(
      new Map(artists.map(a => [a.artist, a])).values()
    );

    let filtered = uniqueArtists;

    if (searchTerm) {
      filtered = filtered.filter((artist) =>
        artist.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'nameAsc':
          return a.artist.localeCompare(b.artist);
        case 'nameDesc':
          return b.artist.localeCompare(a.artist);
        case 'songCountAsc':
          return a.song_count - b.song_count || a.artist.localeCompare(b.artist);
        case 'songCountDesc':
          return b.song_count - a.song_count || a.artist.localeCompare(b.artist);
        case 'lastUpdated':
        default:
          const timeA = new Date(a.latest_update).getTime();
          const timeB = new Date(b.latest_update).getTime();
          return timeB - timeA;
      }
    });

  }, [artists, searchTerm, sortOption]);

  const handleArtistClick = (artist: string) => {
    router.push(`/artists/${encodeURIComponent(artist)}`);
  };

  // Prefetch artist data on hover for instant page transitions
  const handleArtistHover = (artistName: string) => {
    queryClient.prefetchQuery({
      queryKey: ['artist', 'songs', artistName],
      queryFn: () => fetchSongsByArtist(artistName),
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  };



  return (
    <div className="flex flex-col h-full">
      <div className="flex-none px-4 pt-4 pb-2">
        <ArtistControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 gap-6">
              {processedArtists.map((artistInfo, index) => {
                return (
                  <div
                    key={`${artistInfo.artist}-${index}`}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                    onClick={() => handleArtistClick(artistInfo.artist)}
                    onMouseEnter={() => handleArtistHover(artistInfo.artist)}
                  >
                    <div
                      className={`relative h-20 w-20 lg:h-32 lg:w-32 border border-border bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition transform duration-300`}
                    >
                      <Disc className="w-8 h-8 lg:w-16 lg:h-16 text-background" />
                    </div>
                    <span className="text-center text-sm lg:text-base text-foreground truncate w-full px-2">
                      {artistInfo.artist}
                    </span>
                  </div>
                );
              })}
            </div>
            {processedArtists.length === 0 && (
              <div className="text-center text-muted-foreground mt-10">
                No artists found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ArtistContent;