"use client";

import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import Box from "./Box";
import SidebarItem from "./SidebarItem";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";

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
    <div className={twMerge(`flex w-full h-full fixed`, player.activeId && "h-[calc(100%-98px)]")}>
      <div
        className="
          w-[300px]
          hidden
          md:flex
          flex-col
          gap-y-2
          bg-black
          h-full
          px-2
          pb-0
        "
      >
        <Box>
          <div
            className="
              flex
              flex-col
              items-start
              gap-y-4
              px-5
              py-4
            "
          >
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
        </Box>
        <Box className="overflow-y-auto items-center px-4 py-2 h-full">
          Playlist functionality in a future update. Stay tuned.
        </Box>
      </div>
      <main className="h-full w-full flex overflow-y-auto">{children}</main>
    </div>
  );
};

export default Sidebar;
