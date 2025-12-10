"use client";

import { useState, useMemo } from "react";
import { Song } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Disc } from "lucide-react";
import { useRouter } from "next/navigation";
import ArtistControls, { SortOption } from "./ArtistControls";
import { useAllSongs } from "@/hooks/queries/useAllSongs";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";

const ArtistContent = () => {
  const { data: songs, isLoading } = useAllSongs();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("lastUpdated");
  const router = useRouter();

  const artists = useMemo(() => {
    if (!songs) return {};

    const artistData: {
      [key: string]: { songs: Song[]; albums: Set<string> };
    } = {};

    songs.forEach((song) => {
      (song.artist || []).forEach((artist: string) => {
        if (!artistData[artist]) {
          artistData[artist] = { songs: [], albums: new Set() };
        }
        artistData[artist].songs.push(song);
        if (song.album) {
          artistData[artist].albums.add(song.album);
        }
      });
    });

    return artistData;
  }, [songs]);

  const processedArtists = useMemo(() => {
    let filtered = Object.entries(artists);

    if (searchTerm) {
      filtered = filtered.filter(([artist]) =>
        artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort(([artistA, dataA], [artistB, dataB]) => {
      switch (sortOption) {
        case 'nameAsc':
          return artistA.localeCompare(artistB);
        case 'nameDesc':
          return artistB.localeCompare(artistA);
        case 'songCountAsc':
          return dataA.songs.length - dataB.songs.length || artistA.localeCompare(artistB);
        case 'songCountDesc':
          return dataB.songs.length - dataA.songs.length || artistA.localeCompare(artistB);
        case 'lastUpdated':
        default:
          const timeA = Math.max(...dataA.songs.map(s => new Date(s.updated_at || 0).getTime()));
          const timeB = Math.max(...dataB.songs.map(s => new Date(s.updated_at || 0).getTime()));
          return (timeB || 0) - (timeA || 0);
      }
    });

  }, [artists, searchTerm, sortOption]);

  const handleArtistClick = (artist: string) => {
    router.push(`/artists/${encodeURIComponent(artist)}`);
  };

  if (isLoading) {
    return (
      <Box className="flex h-full w-full items-center justify-center">
        <BounceLoader className="text-foreground" size={40} />
      </Box>
    );
  }

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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
              {processedArtists.map(([artist]) => {
                return (
                  <div
                    key={artist}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                    onClick={() => handleArtistClick(artist)}
                  >
                    <div
                      className={`relative h-28 w-28 md:h-36 md:w-36 border border-border bg-secondary rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition transform duration-300`}
                    >
                      <Disc className="w-12 h-12 md:w-16 md:h-16 text-background" />
                    </div>
                    <span className="text-center text-foreground truncate w-full px-2">
                      {artist}
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