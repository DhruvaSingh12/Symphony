import { create } from 'zustand';

export type PlayContext = 
  | 'liked'
  | 'uploaded'
  | 'playlist'
  | 'artist'
  | 'search'
  | 'home'
  | 'album'
  | 'queue'
  | null;

interface PlayerStore {
  ids: number[];
  activeId?: number;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
  reset: () => void;
  
  playingFromQueue: boolean;
  setPlayingFromQueue: (isPlayingFromQueue: boolean) => void;
  
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

  // Playback control
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;

  // Play context tracking - which page/context initiated playback
  playContext: PlayContext;
  playContextId?: string; // For playlists/artists - the specific ID
  setPlayContext: (context: PlayContext, contextId?: string) => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id: number) => set({ activeId: id, playingFromQueue: false }),
  setIds: (ids: number[]) => set({ ids: ids }),
  reset: () => set({ ids: [], activeId: undefined, playContext: null, playContextId: undefined }),

  queue: [],
  addToQueue: (id: number) => set((state) => ({ queue: [...state.queue, id] })),
  addIdsToQueue: (newIds: number[]) => set((state) => ({ queue: [...state.queue, ...newIds] })),
  removeFromQueue: (id: number) => set((state) => ({ queue: state.queue.filter((queueId) => queueId !== id) })),
  shiftQueue: () => set((state) => ({ queue: state.queue.slice(1) })),
  clearQueue: () => set({ queue: [] }),

  lastContextId: undefined,
  setLastContextId: (id: number) => set({ lastContextId: id }),

  isShuffle: false,
  isRepeat: false,
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),

  // Playback control
  isPlaying: false,
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // Play context tracking
  playContext: null,
  playContextId: undefined,
  setPlayContext: (context: PlayContext, contextId?: string) => set({ playContext: context, playContextId: contextId }),

  playingFromQueue: false,
  setPlayingFromQueue: (isPlayingFromQueue: boolean) => set({ playingFromQueue: isPlayingFromQueue }),
}));

export default usePlayer;