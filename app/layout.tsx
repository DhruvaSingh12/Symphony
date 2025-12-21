import type { Metadata } from "next";
import { Figtree, League_Spartan } from "next/font/google";
import "./globals.css";
import Sidebar from '@/components/Sidebar';
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import { fetchUserSongs } from "@/lib/api/songs";
import { createClient } from "@/supabase/server";
import Player from "@/components/player/Player";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/providers/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const font = Figtree({
  subsets: ["latin"],
  variable: "--figtree"
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--league-spartan"
});

export const metadata: Metadata = {
  title: "Quivery",
  description: "Discover Music",
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const userSongs = await fetchUserSongs(supabase);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} ${leagueSpartan.variable} font-sans w-full h-full scrollbar-hide`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            <ToasterProvider />
            <SupabaseProvider>
              <UserProvider>
                <ModalProvider />
                <Sidebar songs={userSongs}>
                  {children}
                  <Analytics />
                  <SpeedInsights />
                </Sidebar>
                <ErrorBoundary>
                  <Player />
                </ErrorBoundary>
              </UserProvider>
            </SupabaseProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}