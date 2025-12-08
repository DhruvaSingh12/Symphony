"use client";

import Library from "./components/LibraryContent";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserSongs } from "@/hooks/queries/useUserSongs";
import { Skeleton } from "@/components/ui/skeleton";

const LibraryPage = () => {
    const { data: songs, isLoading, error } = useUserSongs();

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header>
                    <div className="px-2">
                        <div className="flex items-center gap-x-5">
                            <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
                                <AvatarImage src="/images/library.jpeg" alt="Library" />
                                <AvatarFallback>LB</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-y-2">
                                <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                                    Library
                                </h1>
                                {!isLoading && songs && (
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {songs.length} songs
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 overflow-hidden px-2 md:px-0 md:pr-2 pb-2">
                <Card className="bg-card/60 border-border h-full overflow-auto">
                    {isLoading ? (
                        <CardContent className="p-6 space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    ) : error ? (
                        <CardContent className="p-6">
                            <p className="text-center text-muted-foreground">
                                Error loading your songs. Please try again.
                            </p>
                        </CardContent>
                    ) : (
                        <Library songs={songs || []} />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default LibraryPage;
