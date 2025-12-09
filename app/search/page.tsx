"use client";

import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import SearchInput from "./components/SearchInput";
import { useSongsByQuery } from "@/hooks/queries/useSongsByQuery";
import SearchContent from "./components/SearchContent";
import { ScrollArea } from "@/components/ui/scroll-area";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";
import { Search } from "lucide-react";

const SearchPage = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";

    const { data: songs, isLoading, error } = useSongsByQuery(query);

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="w-full px-2 md:px-0 md:pr-2 mt-2 pb-2">
                <Header className="from-bg-neutral-900">
                    <div className="mb-2 flex flex-col gap-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-foreground">Search</h1>
                        </div>
                        <SearchInput />
                    </div>
                </Header>
            </div>
            <div className="w-full overflow-hidden px-2 md:px-0 md:pr-2 pb-2">
                <ScrollArea className="h-full">
                    {!query ? (
                        <Box className="flex flex-col mt-20 h-full w-full items-center justify-center gap-4">
                            <Search className="h-16 w-16 text-muted-foreground/40" />
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-foreground mb-2">
                                    Start searching
                                </h2>
                                <p className="text-muted-foreground">
                                    Find your favorite songs, artists, and albums
                                </p>
                            </div>
                        </Box>
                    ) : isLoading ? (
                        <Box className="flex mt-20 h-full w-full items-center justify-center">
                            <BounceLoader className="text-foreground" size={40} />
                        </Box>
                    ) : error ? (
                        <Box className="bg-card/60 border-border">
                            <div className="p-6">
                                <p className="text-center text-muted-foreground">
                                    Error loading search results. Please try again.
                                </p>
                            </div>
                        </Box>
                    ) : (
                        <SearchContent songs={songs || []} query={query} isLoading={isLoading} />
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

export default SearchPage;
