"use client";

import qs from "query-string";
import useDebounce from "@/hooks/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Input from "./Input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

const SearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize with URL query if available
    const [query, setQuery] = useState<string>(searchParams.get("query") || "");
    const debouncedQuery = useDebounce<string>(query, 500);

    // Restore from localStorage on mount if URL query is empty
    useEffect(() => {
        if (!searchParams.get("query")) {
            const savedQuery = localStorage.getItem("quivery-last-search");
            if (savedQuery) {
                setTimeout(() => setQuery(savedQuery), 0);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const url = qs.stringifyUrl({
            url: '/search',
            query: { query: debouncedQuery }
        });

        // Persist to localStorage
        if (debouncedQuery) {
            localStorage.setItem("quivery-last-search", debouncedQuery);
        } else if (query === "" && !searchParams.get("query")) {
            localStorage.removeItem("quivery-last-search");
        }

        router.push(url);
    }, [debouncedQuery, router, query, searchParams]);

    // Handle persistence cleanup on unmount
    useEffect(() => {
        return () => {
            const shouldPersist = sessionStorage.getItem("keep-search-persistence");
            if (!shouldPersist) {
                localStorage.removeItem("quivery-last-search");
            }
            sessionStorage.removeItem("keep-search-persistence");
        };
    }, []);

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