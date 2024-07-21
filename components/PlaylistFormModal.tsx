"use client";

import React, { useState, useEffect } from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import toast from "react-hot-toast";
import { Playlists, Song } from "@/types";
import { useUser } from "@/hooks/useUser";
import SongSelectionModal from "./SongSelectionModal";

interface PlaylistFormModalProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  songs: Song[];
  playlists: Playlists[];
}

const PlaylistFormModal: React.FC<PlaylistFormModalProps> = ({ isOpen, onChange, songs, playlists }) => {
  const [name, setName] = useState("");
  const [isSongSelectionModalOpen, setIsSongSelectionModalOpen] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useSupabaseClient();
  const { user } = useUser();

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setSelectedSongIds([]);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const { data: playlist, error: playlistError } = await supabase
        .from("playlists")
        .insert({
          name,
          user_id: user!.id,
        })
        .single();

      if (playlistError) {
        console.error('Playlist error:', playlistError);
        throw new Error("Error inserting playlist");
      }

      const playlistId = playlist?.id.toString();

      if (playlistId && selectedSongIds.length > 0) {
        const playlistSongs = selectedSongIds.map((songId) => ({
          playlist_id: playlistId,
          song_id: songId,
        }));

        const { error: playlistSongsError } = await supabase
          .from("playlist_songs")
          .insert(playlistSongs);

        if (playlistSongsError) {
          console.error('Playlist songs error:', playlistSongsError);
          throw new Error("Error inserting playlist songs");
        }
      }

      toast.success('Playlist created successfully!');
      console.log("Playlist created:", playlist);
      onChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Error creating playlist. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Please enter a playlist name.');
      return false;
    }

    if (selectedSongIds.length === 0) {
      toast.error('Please select songs to add to the playlist.');
      return false;
    }

    if (!user) {
      toast.error('User not authenticated.');
      return false;
    }

    return true;
  };

  const handleSongSelectionSave = (selectedSongIds: number[]) => {
    setSelectedSongIds(selectedSongIds);
    setIsSongSelectionModalOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-neutral-800/30 backdrop-blur-sm fixed inset-0" />
        <Dialog.Content className="fixed drop-shadow-md border border-neutral-800 top-[50%] left-[50%] max-h-full h-full md:h-auto md:max-h-[85vh] w-full md:w-[90vw] md:max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-purple-900 p-6 focus:outline-none">
          <Dialog.Title className="text-xl font-bold text-center mb-4">
            Create Playlist
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm leading-normal text-center">
            Enter playlist details below.
          </Dialog.Description>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="playlist-name">
              Playlist Name
            </label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
              placeholder="Enter playlist name"
              aria-label="Playlist Name"
            />
          </div>
          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white mb-4"
            onClick={() => setIsSongSelectionModalOpen(true)}
            aria-label="Add Songs"
          >
            Add Songs
          </button>
          {selectedSongIds.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-1">Selected Songs:</p>
              <ul className="text-sm text-gray-400">
                {selectedSongIds.map((songId) => {
                  const song = songs.find(song => song.id === songId);
                  return <li key={songId}>{song ? song.title : 'Unknown Song'}</li>;
                })}
              </ul>
            </div>
          )}
          <button
            className={`w-full py-2 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} rounded-md text-white`}
            onClick={handleSubmit}
            disabled={isLoading}
            aria-label="Create Playlist"
          >
            {isLoading ? 'Creating...' : 'Create Playlist'}
          </button>
          <Dialog.Close asChild>
            <button className="text-neutral-500 hover:text-white absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:outline-none" aria-label="Close">
              <IoMdClose />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
      <SongSelectionModal
        isOpen={isSongSelectionModalOpen}
        onClose={() => setIsSongSelectionModalOpen(false)}
        songs={songs}
        onSave={handleSongSelectionSave}
      />
    </Dialog.Root>
  );
};

export default PlaylistFormModal;
