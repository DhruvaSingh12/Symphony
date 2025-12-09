"use client";

import qs from "query-string";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Input from "./Input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

const SearchInput = () => {
    const router = useRouter();
    const [query, setQuery] = useState<string>("");
    const debouncedQuery = useDebounce<string>(query, 500);

    useEffect(() => {
        const url = qs.stringifyUrl({
            url: '/search',
            query: { query: debouncedQuery }
        });
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
            >
                Clear
            </Button>
        </div>
    );
};

export default SearchInput;