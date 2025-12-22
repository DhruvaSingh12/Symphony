import { fetchAlbums } from "@/lib/api/songs";
import { useQuery } from "@tanstack/react-query";

export const useAlbums = () => {
    return useQuery({
        queryKey: ['albums'],
        queryFn: () => fetchAlbums(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
