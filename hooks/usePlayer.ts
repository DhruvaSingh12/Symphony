import { create } from 'zustand';

interface PlayerStore {
  ids: number[];
  activeId?: number;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
  reset: () => void;
  
  queue: number[];
  addToQueue: (id: number) => void;
  addIdsToQueue: (ids: number[]) => void;
  removeFromQueue: (id: number) => void;
  shiftQueue: () => void;
  clearQueue: () => void;

  lastContextId?: number;
  setLastContextId: (id: number) => void;

  isShuffle: boolean;
  isRepeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id: number) => set({ activeId: id }),
  setIds: (ids: number[]) => set({ ids: ids }),
  reset: () => set({ ids: [], activeId: undefined }),

  queue: [],
  addToQueue: (id: number) => set((state) => ({ queue: [...state.queue, id] })),
  addIdsToQueue: (newIds: number[]) => set((state) => ({ queue: [...state.queue, ...newIds] })),
  removeFromQueue: (id: number) => set((state) => ({ queue: state.queue.filter((queueId) => queueId !== id) })),
  shiftQueue: () => set((state) => ({ queue: state.queue.slice(1) })),
  clearQueue: () => set({ queue: [] }),

  lastContextId: undefined,
  setLastContextId: (id: number) => set({ lastContextId: id }),

  // Playback modes
  isShuffle: false,
  isRepeat: false,
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
}));

export default usePlayer;