"use client";

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import React, { useState } from "react";
import PlayButton from "./PlayButton";
import LikeButton from "./LikeButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);
  const [imageLoaded, setImageLoaded] = useState(false);

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
          <PlayButton onClick={() => onClick(String(data.id))} />
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-foreground">{data.title}</p>
            <p className="text-muted-foreground text-sm truncate">{data.artist?.join(', ')}</p>
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Song details</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {data.album && (
                <DropdownMenuItem disabled>
                  <Badge variant="outline" className="mr-2">{data.album}</Badge>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem disabled>
                <Calendar className="mr-2 h-4 w-4" />
                {formattedDate}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <LikeButton songId={data.id} className="h-6 w-6" />
                <span className="ml-2">Like</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

export default SongItem;