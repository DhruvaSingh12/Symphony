"use client";

import useLoadImage from "@/hooks/data/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import React, { useState } from "react";
import PlayButton from "./PlayButton";
import NowPlayingIndicator from "@/components/NowPlaying";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, PlusCircle, ListPlus, Disc, User, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthModal from "@/hooks/ui/useAuthModal";
import usePlaylistModal from "@/hooks/ui/usePlaylistModal";
import useAlbumModal from "@/hooks/ui/useAlbumModal";
import { useUser } from "@/hooks/auth/useUser";
import { useLikeSong, useIsLiked } from "@/hooks/mutations/useLikeSong";
import { useLikedSongs } from "@/hooks/queries/useLikedSongs";
import usePlayer from "@/hooks/ui/usePlayer";
import { toast } from "react-hot-toast";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  const authModal = useAuthModal();
  const playlistModal = usePlaylistModal();
  const albumModal = useAlbumModal();
  const { user } = useUser();
  const isLiked = useIsLiked(data.id);
  const likeMutation = useLikeSong();
  const player = usePlayer();
  const isCurrentSong = player.activeId === data.id;
  const isPlaying = isCurrentSong && player.isPlaying;
  useLikedSongs();

  const artists = data.artist ? (Array.isArray(data.artist) ? data.artist : [data.artist]) : [];

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      return authModal.onOpen();
    }
    playlistModal.onOpen(data.id);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    player.addToQueue(data.id);
    toast.success("Added to queue");
  };

  const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
    e.stopPropagation();
    router.push(`/artists/${encodeURIComponent(artistName)}`);
  };

  const handleAlbumClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (data.album) {
      albumModal.onOpen(data.album);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      return authModal.onOpen();
    }
    likeMutation.mutate({
      songId: data.id,
      isCurrentlyLiked: isLiked
    });
  };

  return (
    <Card className="group relative flex flex-col bg-card/60 hover:bg-card hover:shadow-md border-border transition-all p-3 cursor-pointer">
      <div className="relative w-full aspect-square rounded-md overflow-hidden mb-4 bg-muted">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0" />
        )}
        <Image
          className="object-cover transition-transform group-hover:scale-105"
          src={imagePath || '/images/liked.png'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={data.title || "Song"}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayButton
            onClick={() => {
              if (isCurrentSong) {
                player.togglePlayPause();
              } else {
                onClick(String(data.id));
              }
            }}
            isPlaying={isPlaying}
          />
        </div>
        {/* Now Playing Indicator Badge */}
        {isPlaying && (
          <div className="absolute top-2 left-2 bg-background rounded-md px-2 py-1 flex items-center gap-1">
            <NowPlayingIndicator className="h-3" barCount={3} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-foreground">{data.title}</p>
            <p className="text-muted-foreground text-sm truncate">
              {artists.map((artist, i) => (
                <span key={i}>
                  <span
                    className="hover:underline hover:text-foreground transition cursor-pointer"
                    onClick={(e) => handleArtistClick(e, artist)}
                  >
                    {artist}
                  </span>
                  {i < artists.length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem onClick={handleAddToPlaylist}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add to playlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToQueue}>
                <ListPlus className="mr-2 h-4 w-4" />
                Add to Queue
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {data.album && (
                <DropdownMenuItem onClick={handleAlbumClick} className="cursor-pointer">
                  <Disc className="mr-2 h-4 w-4" />
                  Go to album
                </DropdownMenuItem>
              )}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <User className="mr-2 h-4 w-4" />
                  Go to artists
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {artists.map((artist, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={(e) => handleArtistClick(e, artist)}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {artist}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLike} className="cursor-pointer">
                <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
                <span>{isLiked ? "Remove from Liked" : "Add to Liked"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

export default SongItem;