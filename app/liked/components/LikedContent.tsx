"use client";

import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import { Song } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Table from '@/components/Table'; 

interface LikedContentProps {
  songs: Song[];
}

const LikedContent: React.FC<LikedContentProps> = ({ songs }) => {
  const onPlay = useOnPlay(songs);

  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (songs.length === 0) {
    return (
      <div className="text-neutral-400 text-center flex flex-col gap-y-2 w-full px-6">
        No favourite songs yet.
      </div>
    );
  }

  return (
    <Table songs={songs} onPlay={onPlay} />
  );
};

export default LikedContent;
