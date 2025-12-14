import React from "react";
import { Song } from "@/types";
import Image from "next/image";
import useLoadImage from "@/hooks/useLoadImage";
import { Play, ListMusic } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useOnPlay from "@/hooks/useOnPlay";
import useAlbumModal from "@/hooks/useAlbumModal";

interface AlbumCardProps {
    albumName: string;
    songs: Song[];
    description?: string;
    showYear?: boolean;
    showPlayButton?: boolean;
    onClick?: () => void;
}

const AlbumImage = ({ song, className }: { song?: Song, className?: string }) => {
    const imageUrl = useLoadImage(song || {} as Song);

    if (!song || !song.id) {
        return (
            <div className={`relative overflow-hidden bg-secondary hover:bg-background flex items-center justify-center ${className}`}>
                <ListMusic className="w-1/2 h-1/2 text-muted-foreground group-hover:text-foreground transition transform" />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden bg-muted ${className}`}>
            <Image
                src={imageUrl || '/images/liked.png'}
                alt={song.album || "Album"}
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-cover"
            />
        </div>
    );
}

const AlbumCard: React.FC<AlbumCardProps> = ({
    albumName,
    songs,
    description = "Album",
    showYear = true,
    showPlayButton = true,
    onClick
}) => {
    const songsToDisplay = songs.slice(0, 4);
    const isGrid = songs.length >= 4;
    const onPlay = useOnPlay(songs);
    const albumModal = useAlbumModal();

    // Get year from the first song
    const year = showYear && songs[0]?.created_at ? new Date(songs[0].created_at).getFullYear() : "";

    const handleAlbumClick = () => {
        if (onClick) {
            onClick();
        } else if (albumName) {
            albumModal.onOpen(albumName);
        }
    };

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (songs.length > 0) {
            onPlay(songs[0].id);
        }
    };

    return (
        <div
            onClick={handleAlbumClick}
            className="group flex flex-col gap-y-3 p-3 rounded-md hover:bg-accent/50 cursor-pointer w-full flex-shrink-0 transition"
        >
            <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg bg-secondary">
                {isGrid ? (
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                        {songsToDisplay.map((song) => (
                            <AlbumImage key={song.id} song={song} className="w-full h-full" />
                        ))}
                    </div>
                ) : (
                    <AlbumImage song={songs[0]} className="w-full h-full" />
                )}

                {/* Play overlay */}
                {showPlayButton && (
                    <div
                        onClick={handlePlay}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="bg-primary rounded-full p-3 drop-shadow-md translate-y-2 group-hover:translate-y-0 transition hover:scale-105">
                            <Play className="text-primary-foreground fill-primary-foreground h-5 w-5 pl-0.5" />
                        </div>
                    </div>
                )}
            </div>
            <div>
                <div className="font-semibold text-sm md:text-base truncate">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-sm text-foreground cursor-pointer truncate">
                                    {albumName}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{albumName}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                    {[year, description].filter(Boolean).join(" • ")}
                </p>

            </div>
        </div>
    );
};

export default AlbumCard;