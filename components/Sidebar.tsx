"use client";

import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import Link from "next/link";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className={cn("flex w-full h-full fixed", player.activeId && "h-[calc(100%-80px)]")}>
      <div
        className="
          w-[300px]
          hidden
          md:flex
          flex-col
          gap-y-2
          bg-background
          h-full
          px-2
          pt-2
          pb-1
        "
      >
        <Card className="bg-card/60 border-border">
          <CardContent className="flex flex-col gap-y-3 px-5 py-4">
            {routes.map((item) => (
              <Button
                key={item.label}
                asChild
                variant={item.active ? "secondary" : "ghost"}
                className="justify-start gap-x-4"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="flex-1 bg-card/60 border-border overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center h-full px-4 py-6">
            <p className="text-sm text-muted-foreground text-center">
              Playlist functionality in a future update. Stay tuned.
            </p>
          </CardContent>
        </Card>
      </div>
      <main className="h-full w-full flex pt-2 pb-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default Sidebar;
