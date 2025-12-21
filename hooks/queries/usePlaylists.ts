import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/auth/useUser";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Playlist } from "@/types";

export const usePlaylists = () => {
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();

    return useQuery({
        queryKey: ["playlists", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabaseClient
                .from("playlists")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching playlists:", error);
                throw error;
            }

            return (data as Playlist[]) || [];
        },
        enabled: !!user?.id,
    });
};