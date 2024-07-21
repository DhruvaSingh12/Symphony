"use client";

import { usePathname } from "next/navigation";
import React, { useMemo, useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { TbPlaylist } from "react-icons/tb";
import Box from "./Box";
import SidebarItem from "./SidebarItem";
import { Song, Playlists } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { twMerge } from "tailwind-merge";
import PlaylistFormModal from "./PlaylistFormModal";
import { supabase } from "@/actions/supabaseClient";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
}

const Sidebar: React.FC<SidebarProps> = ({ children, songs = [] }) => {
  const pathname = usePathname();
  const player = usePlayer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlists[]>([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching playlists:', error);
      } else {
        setPlaylists(data || []);
      }
    };

    fetchPlaylists();
  }, []);

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
        <Box className="overflow-y-auto h-full">
          <div className="flex justify-between items-center px-5 py-4">
            <h2 className="text-white text-lg font-semibold">Your Playlists</h2>
            <TbPlaylist
              className="text-white cursor-pointer"
              size={26}
              onClick={() => setIsModalOpen(true)}
            />
          </div>
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div key={playlist.id} className="text-neutral-400 px-5 py-2">
                {playlist.name}
              </div>
            ))
          ) : (
            <div className="text-neutral-400 px-5 py-2">
              No playlists yet, click on the button above to create one.
            </div>
          )}
        </Box>
      </div>
      <main className="h-full w-full flex overflow-y-auto">{children}</main>
      <PlaylistFormModal isOpen={isModalOpen} onChange={setIsModalOpen} songs={songs} playlists={[]} />
    </div>
  );
};

export default Sidebar;
