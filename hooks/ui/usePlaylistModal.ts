import { create } from 'zustand';

interface PlaylistModalStore {
    isOpen: boolean;
    songId?: number;
    onOpen: (songId?: number) => void;
    onClose: () => void;
}

const usePlaylistModal = create<PlaylistModalStore>((set) => ({
    isOpen: false,
    songId: undefined,
    onOpen: (songId) => set({ isOpen: true, songId }),
    onClose: () => set({ isOpen: false, songId: undefined }),
}));

export default usePlaylistModal;
