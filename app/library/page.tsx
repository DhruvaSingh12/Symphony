"use client";

import Library from "./components/LibraryContent";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserSongs } from "@/hooks/queries/useUserSongs";
import { Skeleton } from "@/components/ui/skeleton";

const LibraryPage = () => {
    const { data: songs, isLoading, error } = useUserSongs();

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex flex-col items-start gap-1">
                        <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                            Library
                        </h1>
                        {!isLoading && songs && (
                            <div>
                                {songs.length} {songs.length === 1 ? "song" : "songs"}
                            </div>
                        )}
                    </div>
                </Header>
            </div>
            <div className="w-full overflow-hidden px-2 md:px-0 md:pr-2 mt-2 pb-2">
                <ScrollArea className="h-full">
                    {isLoading ? (
                        <Card className="bg-card/60 border-border">
                            <CardContent className="p-6 space-y-3">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    ) : error ? (
                        <Card className="bg-card/60 border-border">
                            <CardContent className="p-6">
                                <p className="text-center text-muted-foreground">
                                    Error loading your songs. Please try again.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Library songs={songs || []} />
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default LibraryPage;
