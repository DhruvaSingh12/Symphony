import type { Metadata } from "next";
import Header from '@/components/Header';
import PageContent from './components/PageContent';
import { fetchAllSongs } from '@/lib/api/songs';
import { createClient } from "@/supabase/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

export const metadata: Metadata = {
  title: "Home | Quivery",
  description: "Discover and stream your favorite music on Quivery.",
};

export const revalidate = 60;

const greetings = [
  "Welcome back",
  "Heyy",
  "Good to see you",
  "Ready to vibe",
  "Let's play some music",
  "What's on your playlist",
  "Time for some tunes",
  "Music awaits",
  "Let's get grooving",
  "Your music, your way",
];

const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

export default async function Home() {
  const supabase = await createClient();
  const songs = await fetchAllSongs(supabase);

  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['songs', undefined],
    queryFn: () => songs,
    initialPageParam: 0,
  });

  const { data: { user } } = await supabase.auth.getUser();
  let firstName = "";

  if (user) {
    const { data: userDetails } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (userDetails) {
      firstName = userDetails.full_name?.split(' ')[0] || '';
    }
  }

  const greeting = firstName
    ? `${randomGreeting}, ${firstName}`
    : "Welcome Listener";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
          <Header className="bg-transparent">
            <div className="px-1">
              <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
                {greeting}
              </h1>
            </div>
          </Header>
        </div>
        <div className="flex-1 overflow-hidden mt-2 px-2 md:px-0 md:pr-2 pb-2">
          <PageContent songs={songs || []} />
        </div>
      </div>
    </HydrationBoundary>
  );
}