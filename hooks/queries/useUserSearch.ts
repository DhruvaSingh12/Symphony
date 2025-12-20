import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { UserDetails } from "@/types";
import { searchUsers, getUserById } from "@/lib/api/users";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";

// Search users with debouncing
export const useSearchUsers = (query: string, limit: number = 10) => {
    const supabaseClient = useSupabaseClient();
    const debouncedQuery = useDebounce(query, 300); // 300ms debounce

    return useQuery<UserDetails[]>({
        queryKey: ["search-users", debouncedQuery, limit],
        queryFn: () => searchUsers(debouncedQuery, limit, supabaseClient),
        enabled: debouncedQuery.trim().length >= 2, // Only search with 2+ characters
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Get user by ID
export const useUserById = (userId: string) => {
    const supabaseClient = useSupabaseClient();

    return useQuery<UserDetails | null>({
        queryKey: ["user-by-id", userId],
        queryFn: () => getUserById(userId, supabaseClient),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10, // 10 minutes - user data changes infrequently
    });
};

// Custom hook for managing search state with debouncing
export const useUserSearchState = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);

    const { data: searchResults, isLoading } = useSearchUsers(debouncedQuery);

    const isTyping = searchQuery !== debouncedQuery;
    const isSearching = (isTyping && searchQuery.trim().length >= 2) || isLoading;

    return {
        searchQuery,
        setSearchQuery,
        searchResults: searchResults || [],
        isSearching,
        hasMinimumQuery: searchQuery.trim().length >= 2
    };
};