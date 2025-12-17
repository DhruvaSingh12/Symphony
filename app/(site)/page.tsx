"use client";

import Header from '@/components/Header';
import PageContent from './components/PageContent';
import { useAllSongs } from '@/hooks/queries/useAllSongs';
import { useUser } from '@/hooks/useUser';

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

export default function Home() {
  const { data: songs, error } = useAllSongs();
  const { user, userDetails } = useUser();

  const greeting = user && userDetails?.first_name
    ? `${randomGreeting}, ${userDetails.first_name}`
    : "Welcome Listener";

  return (
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
        {error ? (
          <div className="p-4">
            <p className="text-center text-muted-foreground">
              Error loading songs. Please try again.
            </p>
          </div>
        ) : (
          <PageContent songs={songs || []} />
        )}
      </div>
    </div>
  );
}