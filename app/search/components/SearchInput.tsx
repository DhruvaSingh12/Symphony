"use client";

import qs from "query-string";
import useDebounce from "@/hooks/utils/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Input from "./Input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

const SearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize with URL query if available
    const urlQuery = searchParams.get("query") || "";
    const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
    const [query, setQuery] = useState<string>(urlQuery);
    const debouncedQuery = useDebounce<string>(query, 500);

    // Sync input with URL if URL changes
    if (urlQuery !== prevUrlQuery) {
        setPrevUrlQuery(urlQuery);
        setQuery(urlQuery);
    }

    useEffect(() => {
        const url = qs.stringifyUrl({
            url: '/search',
            query: { query: debouncedQuery }
        });

        if (debouncedQuery) {
            localStorage.setItem("quivery-last-search", debouncedQuery);
        }

        router.push(url);
    }, [debouncedQuery, router]);

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="What do you want to play?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                />
            </div>
            <Button
                type="button"
                variant="outline"
                onClick={() => setQuery("")}
                disabled={!query}
                className="rounded-full"
            >
                Clear
            </Button>
        </div>
    );
};

export default SearchInput;