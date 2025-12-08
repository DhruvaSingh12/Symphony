import { create } from 'zustand';

interface PlayerStore {
  ids: number[];
  activeId?: number;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id: number) => set({ activeId: id }),
  setIds: (ids: number[]) => set({ ids: ids }),
}));

export default usePlayer;
