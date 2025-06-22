"use client";

import useLoadImage from "@/hooks/useLoadImage";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface MediaItemProps {
    data: Song;
    onClick?: (id: string) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick }) => {
    const imageUrl = useLoadImage(data);
    const player = usePlayer();

    const handleClick = () => {
        if (onClick) {
            onClick(data.id);
        }
        return player.setId(data.id);
    };

    return (
        <Button
            variant="ghost"
            onClick={handleClick}
            className={cn(
                "flex items-center gap-x-3 w-full p-2 rounded-md",
                "hover:bg-foreground/10 transition-colors"
            )}
        >
            <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
                <Image
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={imageUrl || '/images/liked.png'}
                    alt="Media item"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col gap-y-0.5 overflow-hidden text-left">
                <p className="text-foreground truncate font-medium">
                    {data.title}
                </p>
                <p className="text-foreground/70 truncate text-sm">
                    {data.artist.join(', ')}
                </p>
            </div>
        </Button>
    );
}

export default MediaItem;
