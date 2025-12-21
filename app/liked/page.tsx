import type { Metadata } from "next";
import { fetchLikedSongs } from "@/lib/api/songs";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import LikedPageClient from "./components/LikedPageClient";
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import HydrateClient from "@/components/HydrateClient";

export const metadata: Metadata = {
  title: "Liked Songs | Quivery",
  description: "Your favorite tracks, all in one place.",
};

export const revalidate = 30;

const LikedPage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?auth=true');
  }

  const songs = await fetchLikedSongs(supabase, 0, 50);
  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.user.likedSongs(user.id), songs);

  return (
    <HydrateClient state={dehydrate(queryClient)}>
      <LikedPageClient songs={songs} />
    </HydrateClient>
  );
};

export default LikedPage;