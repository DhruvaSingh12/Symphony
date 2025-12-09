"use client";

import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { Heart, Home, Library, Search } from "lucide-react";
import Link from "next/link";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RxPerson } from "react-icons/rx";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const pathname = usePathname();
  const player = usePlayer();

  const routes = useMemo(
    () => [
      {
        icon: Home,
        label: "Home",
        active: pathname == "/",
        href: "/",
      },
      {
        icon: Search,
        label: "Search",
        active: pathname === "/search",
        href: "/search",
      },
      {
        icon: Library,
        label: "Library",
        active: pathname === "/library",
        href: "/library",
      },
      {
        icon: Heart,
        label: "Liked",
        active: pathname === "/liked",
        href: "/liked",
      },
      {
        icon: RxPerson,
        label: "Artists",
        active: pathname === "/artists",
        href: "/artists",
      },
    ],
    [pathname]
  );

  return (
    <div className={cn("flex w-full h-full fixed", player.activeId && "h-[calc(100%-77px)]")}>
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
          pb-2
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
          <CardContent className="flex flex-col items-center justify-center h-full px-4 py-6 gap-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Playlist functionality in a future update. Stay tuned.
            </p>
          </CardContent>
        </Card>
      </div>
      <main className="h-full w-full flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default Sidebar;
