"use client";

import useLoadImage from "@/hooks/data/useLoadImage";
import usePlayer from "@/hooks/ui/usePlayer";
import { Song } from "@/types";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MediaItemProps {
    data: Song;
    onClick?: (id: number) => void;
    className?: string;
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick, className }) => {
    const imageUrl = useLoadImage(data);
    const player = usePlayer();
    const router = useRouter();

    const artists = data.artist ? (Array.isArray(data.artist) ? data.artist : [data.artist]) : [];

    const handleClick = () => {
        if (onClick) {
            onClick(data.id);
        }
        return player.setId(data.id);
    };

    const handleArtistClick = (e: React.MouseEvent, artistName: string) => {
        e.stopPropagation();
        sessionStorage.setItem("keep-search-persistence", "true");
        router.push(`/artists/${encodeURIComponent(artistName)}`);
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "flex items-center gap-x-3 cursor-pointer w-full p-2 rounded-md transition",
                className
            )}
        >
            {/* Square image with rounded-md borders */}
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border">
                <Image
                    src={imageUrl || '/images/liked.png'}
                    alt={data.title || "Media item"}
                    fill
                    className="object-cover"
                />
            </div>
            {/* Title and Artist */}
            <div className="flex flex-col gap-y-0.5 overflow-hidden flex-1 min-w-0">
                <p className="text-foreground truncate font-medium text-sm">
                    {data.title}
                </p>
                <div className="text-muted-foreground truncate text-xs">
                    {artists.map((artist, index) => (
                        <span key={index}>
                            <span
                                className="hover:underline cursor-pointer hover:text-foreground transition"
                                onClick={(e) => handleArtistClick(e, artist)}
                            >
                                {artist}
                            </span>
                            {index < artists.length - 1 && ", "}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MediaItem;
