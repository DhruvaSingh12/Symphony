"use client";

import React from 'react';
import { Song } from '@/types';
import useOnPlay from '@/hooks/useOnPlay';
import useLoadImage from '@/hooks/useLoadImage';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Play } from "lucide-react";

interface SearchContentProps {
    songs: Song[];
}

const SongRow: React.FC<{ song: Song; onPlay: (id: string) => void }> = ({ song, onPlay }) => {
    const imageUrl = useLoadImage(song) || "/images/liked.png";
    const initials = (song.title || "?").slice(0, 2).toUpperCase();

    return (
        <div className="flex items-center gap-3 py-3">
            <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={imageUrl} alt={song.title || "Song artwork"} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-foreground">{song.title || "Untitled"}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {song.author && <Badge variant="secondary">{song.author}</Badge>}
                    {song.album && <Badge variant="outline">{song.album}</Badge>}
                </div>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onPlay(song.id)}
                        aria-label={`Play ${song.title}`}
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Play now</TooltipContent>
            </Tooltip>
        </div>
    );
};

const SearchContent: React.FC<SearchContentProps> = ({ songs }) => {
        const onPlay = useOnPlay(songs);

        if (songs.length === 0) {
                return (
                        <Card className="bg-card/60 border-border">
                            <CardHeader>
                                <CardTitle>No results found</CardTitle>
                                <CardDescription>Try adjusting your search or check back soon.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                );
        }

        return (
            <TooltipProvider>
            <Tabs defaultValue="songs" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="songs" className="flex items-center gap-2">
                        Songs <Badge variant="outline">{songs.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="quick">Quick pick</TabsTrigger>
                </TabsList>

                <TabsContent value="songs">
                    <Card className="bg-card/60 border-border">
                        <CardHeader>
                            <CardTitle>Search results</CardTitle>
                            <CardDescription>Play instantly or browse the list below.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[440px] px-6">
                                {songs.map((song, index) => (
                                    <React.Fragment key={song.id}>
                                        <SongRow song={song} onPlay={onPlay} />
                                        {index < songs.length - 1 && <Separator className="bg-border" />}
                                    </React.Fragment>
                                ))}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quick">
                    <Card className="bg-card/60 border-border">
                        <CardHeader>
                            <CardTitle>Quick pick</CardTitle>
                            <CardDescription>Use the palette to jump to a track.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Command className="border border-border rounded-lg">
                                <CommandInput placeholder="Filter tracks..." />
                                <CommandList>
                                    <CommandEmpty>No tracks match.</CommandEmpty>
                                    <CommandGroup heading="Tracks">
                                        {songs.map((song) => (
                                            <CommandItem key={song.id} onSelect={() => onPlay(song.id)}>
                                                <Play className="h-4 w-4" />
                                                <span className="truncate">{song.title || "Untitled"}</span>
                                                {song.author && <Badge variant="secondary" className="ml-auto">{song.author}</Badge>}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            </TooltipProvider>
        );
};

export default SearchContent;
