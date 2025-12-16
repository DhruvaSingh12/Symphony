import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlaybackSettingsStore {
  autoplay: boolean;
  rememberVolume: boolean;
  volume: number;
  
  setAutoplay: (value: boolean) => void;
  setRememberVolume: (value: boolean) => void;
  setVolume: (value: number) => void;
}

const usePlaybackSettings = create<PlaybackSettingsStore>()(
  persist(
    (set) => ({
      autoplay: true,
      rememberVolume: true,
      volume: 1,

      setAutoplay: (value) => set({ autoplay: value }),
      setRememberVolume: (value) => set({ rememberVolume: value }),
      setVolume: (value) => set({ volume: value }),
    }),
    {
      name: 'quivery-playback-settings',
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

export default usePlaybackSettings;