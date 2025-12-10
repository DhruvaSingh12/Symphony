"use client";

import Library from "./components/LibraryContent";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { useUserSongs } from "@/hooks/queries/useUserSongs";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";

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
            <div className="flex-1 overflow-auto px-2 md:px-0 md:pr-2 mt-2 pb-2">
                {isLoading ? (
                    <Box className="flex mt-20 h-full w-full items-center justify-center">
                        <BounceLoader className="text-foreground" size={40} />
                    </Box>
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
            </div>
        </div>
    );
};

export default LibraryPage;