import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from '@/components/Sidebar';
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import getSongsByUserId from "@/actions/getSongsByUserId";
import Player from "@/app/player/Player";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider";

const font = Figtree({ subsets: ["latin"] });

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
  const userSongs = await getSongsByUserId();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} w-full h-full`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ToasterProvider />
          <SupabaseProvider>
            <UserProvider>
              <ModalProvider />
              <Sidebar songs={userSongs}>
                {children}
                <Analytics />
                <SpeedInsights />
              </Sidebar>
              <Player />
            </UserProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
