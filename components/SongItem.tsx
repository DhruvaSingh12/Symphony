"use client";

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import PlayButton from "./PlayButton";
import LikeButton from "./LikeButton";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);

  const getDayWithSuffix = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric"
    };
    const monthYear = date.toLocaleDateString('en-US', options);
    const day = getDayWithSuffix(date.getDate());
    const formattedDate = `${monthYear.split(' ')[0]} ${day}, ${monthYear.split(' ')[1]}`;
    return formattedDate;
  };

  const formattedDate = formatDate(data.created_at);

  return (
    <Card className="group relative flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-background/20 hover:bg-background/30 transition p-3">
      <div className="relative w-full h-full aspect-square rounded-md overflow-hidden">
        <Image
          className="object-cover"
          src={imagePath || '/images/liked.png'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt="Image"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayButton onClick={() => onClick(data.id)} />
        </div>
      </div>
      <div className="flex flex-col items-start w-full pt-4 gap-y-1">
        <p className="font-semibold truncate w-full text-foreground">{data.title}</p>
        <div className="flex items-center justify-between w-full pt-1">
          <p className="text-foreground/70 text-sm truncate">{data.artist.join(', ')}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-foreground/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm">
              <DropdownMenuItem className="text-sm text-foreground/70">
                Album: {data.album}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-foreground/70">
                Added: {formattedDate}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-foreground/70 flex items-center justify-between">
                Add to liked
                <LikeButton songId={data.id} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

export default SongItem;