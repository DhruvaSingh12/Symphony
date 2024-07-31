"use client";

import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import PlayButton from "./PlayButton";
import LikeButton from "./LikeButton";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imagePath = useLoadImage(data);

  const getDayWithSuffix = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric"
    };
    const monthYear = date.toLocaleDateString('en-US', options);
    const day = getDayWithSuffix(date.getDate());
    const formattedDate = `${monthYear.split(' ')[0]} ${day}, ${monthYear.split(' ')[1]}`;
    return formattedDate;
  };

  const formattedDate = formatDate(data.created_at);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="
        relative
        group
        flex
        flex-col
        items-center
        justify-center
        rounded-md
        overflow-hidden
        gap-x-4
        bg-neutral-400/35
        cursor-pointer
        hover:bg-neutral-400/15
        transition
        p-3
      "
    >
      <div className="relative w-full h-full aspect-square rounded-md overflow-hidden">
        <Image
          className="object-cover"
          src={imagePath || '/images/liked.png'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt="Image"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayButton onClick={() => onClick(data.id)} />
        </div>
      </div>
      <div className="flex flex-col items-start w-full pt-4 gap-y-1">
        <p className="font-semibold truncate w-full">{data.title}</p>
        <div className="relative flex flex-col items-center justify-between w-full pt-1">
          <p className="text-neutral-200 text-sm w-full truncate">{data.artist.join(', ')}</p>
          <button
            type="button"  
            className="text-neutral-200 ml-28"
            onClick={toggleDropdown}  
            aria-haspopup="true"
          >
            &#x22EE; 
          </button>
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="mt-2 w-30 bg-neutral-400/25 text-white rounded-md z-10"
            >
              <div className="py-2">
                <p className="px-4 py-2 text-sm border-b border-neutral-500">{data.album}</p>  
                <p className="px-4 py-2 text-sm border-t border-neutral-500">{formattedDate}</p>
                <div className="px-4 py-2 text-sm border-t border-neutral-500">Add to liked <LikeButton songId={data.id} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SongItem;