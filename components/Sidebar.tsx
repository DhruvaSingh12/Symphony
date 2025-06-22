"use client";

import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
}

const Sidebar: React.FC<SidebarProps> = ({ children, songs = [] }) => {
  const pathname = usePathname();
  const player = usePlayer();

  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: "Home",
        active: pathname !== "/search",
        href: "/",
      },
      {
        icon: BiSearch,
        label: "Search",
        active: pathname === "/search",
        href: "/search",
      },
    ],
    [pathname]
  );

  return (
    <div className={twMerge(`flex w-full h-full fixed`, player.activeId && "h-[calc(100%-80px)]")}>
      <div className="hidden md:flex flex-col gap-y-2 bg-background/20 backdrop-blur-sm h-full w-[300px] p-2">
        <Card className="bg-background/20 border-none">
          <div className="flex flex-col items-start gap-y-4 px-5 py-4">
            {routes.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => window.location.href = item.href}
                className={cn(
                  "w-full justify-start gap-x-4 text-foreground/70 hover:text-foreground hover:bg-foreground/10",
                  item.active && "text-foreground bg-foreground/10"
                )}
              >
                <item.icon size={24} />
                {item.label}
              </Button>
            ))}
            <div className="w-full flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </Card>
        <Card className="bg-background/20 border-none flex-1">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Your Library</h2>
              <Separator className="bg-foreground/10 mb-4" />
              <div className="text-foreground/70 text-sm">
                Playlist functionality in a future update. Stay tuned.
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
      <main className="h-full w-full flex pt-2 pb-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default Sidebar;
