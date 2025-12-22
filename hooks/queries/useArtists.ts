import { fetchArtists } from "@/lib/api/songs";
import { useQuery } from "@tanstack/react-query";

export const useArtists = () => {
    return useQuery({
        queryKey: ['artists'],
        queryFn: () => fetchArtists(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
