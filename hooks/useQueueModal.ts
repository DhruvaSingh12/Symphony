import { create } from 'zustand';

interface QueueModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useQueueModal = create<QueueModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useQueueModal;