import React, { useState } from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";
import { Song } from "@/types";

interface SongSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  onSave: (selectedSongIds: number[]) => void;
}

const SongSelectionModal: React.FC<SongSelectionModalProps> = ({ isOpen, onClose, songs, onSave }) => {
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);

  const handleCheckboxChange = (songId: number) => {
    setSelectedSongIds(prev => (
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    ));
  };

  const handleSave = () => {
    onSave(selectedSongIds);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-neutral-800/30 backdrop-blur-sm fixed inset-0" />
        <Dialog.Content className="fixed drop-shadow-md border border-neutral-800 top-[50%] left-[50%] max-h-full h-full md:h-auto md:max-h-[85vh] w-full md:w-[90vw] md:max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-purple-900 p-6 focus:outline-none">
          <Dialog.Title className="text-xl font-bold text-center mb-4">
            Select Songs
          </Dialog.Title>
          <div className="mb-5 text-sm leading-normal text-center">
            Select songs to add to the playlist.
          </div>
          <div className="overflow-y-auto max-h-60">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={song.id.toString()}
                  checked={selectedSongIds.includes(song.id)}
                  onChange={() => handleCheckboxChange(song.id)}
                  className="mr-2"
                />
                <label htmlFor={song.id.toString()} className="text-white">{song.title} - {song.artist.join(', ')}</label>
              </div>
            ))}
          </div>
          <button
            className={`w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white mt-4 ${selectedSongIds.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleSave}
            disabled={selectedSongIds.length === 0}
          >
            Save
          </button>
          <Dialog.Close asChild>
            <button className="text-neutral-500 hover:text-white absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:outline-none">
              <IoMdClose />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SongSelectionModal;
