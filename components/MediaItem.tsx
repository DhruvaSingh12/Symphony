"use client";

import useLoadImage from "@/hooks/useLoadImage";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types";
import Image from "next/image";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MediaItemProps {
    data: Song;
    onClick?: (id: string) => void;
    className?: string;
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick, className }) => {
    const imageUrl = useLoadImage(data);
    const player = usePlayer();

    const handleClick = () => {
        if (onClick) {
            onClick(data.id);
        }
        return player.setId(data.id);
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "flex items-center gap-x-3 cursor-pointer hover:bg-accent/50 w-full p-2 rounded-md transition",
                className
            )}
        >
            <Avatar className="h-12 w-12 border border-border">
                <AvatarImage
                    src={imageUrl || '/images/liked.png'}
                    alt={data.title || "Media item"}
                />
                <AvatarFallback>
                    {data.title?.charAt(0) || "?"}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-y-0.5 overflow-hidden flex-1">
                <p className="text-foreground truncate font-medium">
                    {data.title}
                </p>
                <p className="text-muted-foreground truncate text-sm">
                    {data.artist.join(', ')}
                </p>
            </div>
        </div>
    );
}

export default MediaItem;
