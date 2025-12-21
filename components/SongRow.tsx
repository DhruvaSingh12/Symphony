"use client";

import React from "react";
import { Song, UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import useLoadImage from "@/hooks/data/useLoadImage";
import useLoadAvatar from "@/hooks/data/useLoadAvatar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, MoreHorizontal, PlusCircle, ListPlus, Disc, User, Heart, Trash2 } from "lucide-react";
import NowPlayingIndicator from "@/components/NowPlaying";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import LikeButton from "@/components/LikeButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useAuthModal from "@/hooks/ui/useAuthModal";
import usePlaylistModal from "@/hooks/ui/usePlaylistModal";
import useAlbumModal from "@/hooks/ui/useAlbumModal";
import { useUser } from "@/hooks/auth/useUser";
import { useLikeSong, useIsLiked } from "@/hooks/mutations/useLikeSong";
import { useRemoveSongFromPlaylist } from "@/hooks/mutations/usePlaylist";
import usePlayer from "@/hooks/ui/usePlayer";
import { toast } from "react-hot-toast";

interface SongRowProps {
  song: Song;
  index: number;
  onPlay: (id: number) => void;

  showArtist?: boolean;
  showAlbum?: boolean;
  showDuration?: boolean;
  layout?: "default" | "search" | "queue";
  playlistId?: string;
  isOwner?: boolean;
  showRemove?: boolean;
  addedBy?: UserDetails;
  addedAt?: string;
  showAddedBy?: boolean;
}

const formatTime = (seconds: number | null): string => {
  if (seconds === null || seconds === undefined) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  onPlay,
  showArtist = true,
  showAlbum = true,
  showDuration = true,
  layout = "default",
  playlistId,
  showRemove = false,
  addedBy,
}) => {
  const imageUrl = useLoadImage(song) || "/images/liked.png";
  const addedByAvatarUrl = useLoadAvatar(addedBy || null);
  const initials = (song.title || "?").slice(0, 2).toUpperCase();
  const router = useRouter();
  const artists = song.artist
    ? Array.isArray(song.artist)
      ? song.artist
      : [song.artist]
    : [];

  // Auth & Like Logic
  const authModal = useAuthModal();
  const playlistModal = usePlaylistModal();
  const albumModal = useAlbumModal();
  const { user } = useUser();
  const isLiked = useIsLiked(song.id);
  const likeMutation = useLikeSong();
  const removeSongMutation = useRemoveSongFromPlaylist();
  const player = usePlayer();
  const isCurrentSong = player.activeId === song.id;
  const isPlaying = isCurrentSong && player.isPlaying;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      return authModal.onOpen();
    }
    likeMutation.mutate({
      songId: song.id,
      isCurrentlyLiked: isLiked,
    });
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      return authModal.onOpen();
    }
    playlistModal.onOpen(song.id);
  };

  const handleRemoveFromPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playlistId) return;
    removeSongMutation.mutate({
      playlistId,
      songId: song.id,
    });
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    player.addToQueue(song.id);
    toast.success("Added to queue");
  };

  const handleRemoveFromQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    player.removeFromQueue(song.id);
    toast.success("Removed from queue");
  };

  const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
    e.stopPropagation();
    sessionStorage.setItem("keep-search-persistence", "true");
    router.push(`/artists/${encodeURIComponent(artistName)}`);
  };

  const handleAlbumClick = () => {
    if (song.album) {
      albumModal.onOpen(song.album);
    }
  };

  const gridCols =
    layout === "queue"
      ? "grid-cols-[auto_40px_1fr_40px]" // Minimal layout: Index, Image, Title (flex), Action
      : showAlbum
        ? "md:grid-cols-[auto_auto_minmax(200px,1fr)_minmax(150px,1fr)_80px_minmax(150px,1fr)_auto_auto]"
        : "md:grid-cols-[auto_auto_minmax(200px,1fr)_minmax(150px,1fr)_80px_auto_auto]";

  // For queue layout, we override the Grid container class completely
  if (layout === "queue") {
    return (
      <div className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-md transition group/row w-full">
        {/* Image */}
        <div className="relative h-10 w-10 min-w-[40px] rounded-md overflow-hidden">
          <Avatar className="h-full w-full bg-transparent">
            <AvatarImage
              src={imageUrl}
              alt={song.title || "Song artwork"}
              className="object-cover h-full w-full"
            />
            <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
          </Avatar>
        </div>

        {/* Title */}
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <p
            className={`truncate font-medium text-sm ${isCurrentSong ? "text-primary" : "text-foreground"
              }`}
          >
            {song.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {song.artist || "Unknown Artist"}
          </p>
        </div>

        {/* Remove Button */}
        {showRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFromQueue}
            className="opacity-0 group-hover/row:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto] ${gridCols} 
        items-center gap-2 md:gap-3 py-3 w-full hover:bg-muted/30 rounded-md transition my-1 p-1 md:p-2 group/row`}
    >
      {/* Index Column / Now Playing */}
      <div className="flex items-center justify-center w-8 text-xs md:text-sm font-medium">
        {isPlaying ? (
          <NowPlayingIndicator className="h-4" />
        ) : (
          <span className="text-muted-foreground">{index + 1}</span>
        )}
      </div>

      {/* Play/Pause Button with Avatar */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          if (isCurrentSong) {
            // Toggle play/pause for current song
            player.togglePlayPause();
          } else {
            // Play this song
            onPlay(song.id);
          }
        }}
        aria-label={isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
        className="relative group"
      >
        <Avatar className="md:h-12 md:w-12 h-10 w-10 border border-border rounded-full flex-shrink-0">
          <AvatarImage
            src={imageUrl}
            alt={song.title || "Song artwork"}
            className="object-cover"
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          {isPlaying ? (
            <Pause className="md:h-8 md:w-8 h-6 w-6 text-white fill-white" />
          ) : (
            <Play className="md:h-8 md:w-8 h-6 w-6 text-white fill-white translate-x-0.5" />
          )}
        </div>
      </Button>

      {/* Title */}
      <div className="flex flex-col justify-center overflow-hidden">
        <p className="truncate font-semibold text-foreground text-sm md:text-base leading-tight">
          {song.title || "Untitled"}
        </p>
        {layout === "search" && (
          <div className="text-sm text-muted-foreground truncate group/artist">
            {artists.map((artist, artistIndex) => (
              <span key={artistIndex}>
                <span
                  className="hover:underline cursor-pointer hover:text-foreground transition"
                  onClick={(e) => handleArtistClick(e, artist)}
                >
                  {artist}
                </span>
                {artistIndex < artists.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={`${showArtist && layout !== "search" ? "hidden md:flex" : "hidden"
          } flex-col justify-center overflow-hidden`}
      >
        <div className="text-sm text-muted-foreground truncate">
          {artists.map((artist, artistIndex) => (
            <TooltipProvider key={artistIndex}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <span
                      className="hover:underline cursor-pointer hover:text-foreground transition"
                      onClick={(e) => handleArtistClick(e, artist)}
                    >
                      {artist}
                    </span>
                    {artistIndex < artists.length - 1 && ", "}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">View more by {artist}.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Duration - Always shown */}
      <div
        className={`${showDuration ? "flex" : "hidden"
          } items-center justify-center text-xs md:text-sm text-muted-foreground`}
      >
        {formatTime(song.duration)}
      </div>

      {/* Album - Hidden on mobile, shown on md+ */}
      {showAlbum && (
        <div className="hidden md:flex items-center overflow-hidden">
          {song.album ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer truncate"
                    onClick={handleAlbumClick}
                  >
                    {song.album}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{song.album}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      )}

      {/* Like Button / Added By Avatar */}
      <div className="flex items-center justify-center">
        {playlistId && addedBy ? (
          <Avatar className="h-7 w-7 cursor-pointer transition-all">
            <AvatarImage className="object-cover" src={addedByAvatarUrl || undefined} />
            <AvatarFallback className="text-xs bg-muted">
              {addedBy.full_name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <LikeButton songId={song.id} />
        )}
      </div>

      {/* More Button */}
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 md:h-8 md:w-8 transition-opacity"
            >
              <MoreHorizontal className="md:h-5 md:w-5 h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="md:w-48 w-42">
            <DropdownMenuItem
              onClick={handleAddToPlaylist}
              className="cursor-pointer"
            >
              <PlusCircle className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
              Add to playlist
            </DropdownMenuItem>
            {playlistId && (
              <DropdownMenuItem
                onClick={handleRemoveFromPlaylist}
                className="cursor-pointer focus:text-red-500"
              >
                <Trash2 className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                Remove from playlist
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={handleAddToQueue}
              className="cursor-pointer"
            >
              <ListPlus className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
              Add to Queue
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {song.album && (
              <DropdownMenuItem
                onClick={handleAlbumClick}
                className="cursor-pointer"
              >
                <Disc className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                Go to album
              </DropdownMenuItem>
            )}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <User className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                Go to artists
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {artists.map((artist, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={(e) => handleArtistClick(e, artist)}
                    className="cursor-pointer"
                  >
                    <User className="md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3" />
                    {artist}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLike} className="cursor-pointer">
              <Heart
                className={`md:mr-2 mr-1 md:h-4 md:w-4 h-3 w-3 ${isLiked ? "fill-primary text-primary" : ""
                  }`}
              />
              <span>{isLiked ? "Remove from Liked" : "Add to Liked"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SongRow;