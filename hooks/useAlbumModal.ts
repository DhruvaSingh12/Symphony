
import { create } from "zustand";

interface AlbumModalStore {
    isOpen: boolean;
    albumName: string | null;
    onOpen: (albumName: string) => void;
    onClose: () => void;
}

const useAlbumModal = create<AlbumModalStore>((set) => ({
    isOpen: false,
    albumName: null,
    onOpen: (albumName: string) => set({ isOpen: true, albumName }),
    onClose: () => set({ isOpen: false, albumName: null })
}));

export default useAlbumModal;
