import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { parseLRC, LyricLine } from "@/lib/lyricsUtils";

export const useLyrics = (lyricsPath: string | null) => {
    const supabaseClient = useSupabaseClient();

    return useQuery<LyricLine[]>({
        queryKey: ["lyrics", lyricsPath],
        queryFn: async () => {
            if (!lyricsPath) return [];

            const { data, error } = await supabaseClient.storage
                .from("lyrics")
                .download(lyricsPath);

            if (error) {
                console.error("Error downloading lyrics:", error);
                return [];
            }

            const content = await data.text();
            return parseLRC(content);
        },
        enabled: !!lyricsPath,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
};