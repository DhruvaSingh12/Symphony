"use client";

import { useSearchParams } from "next/navigation";
import { useSongsByQuery } from "@/hooks/queries/useSongsByQuery";
import Header from "@/components/Header";
import SearchInput from "./components/SearchInput";
import SearchContent from "./components/SearchContent";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const SearchPage = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";

    const { data: songs, isLoading, error } = useSongsByQuery(query);

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="mb-2 flex flex-col gap-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-foreground">Search</h1>
                            {!isLoading && songs && (
                                <Badge variant="outline" className="rounded-full">
                                    {songs.length} results
                                </Badge>
                            )}
                        </div>
                        <SearchInput />
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
                                    Error loading songs. Please try again.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <SearchContent songs={songs || []} />
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default SearchPage;
