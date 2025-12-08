export const queryKeys = {
  songs: {
    all: ['songs'] as const,
    lists: () => [...queryKeys.songs.all, 'list'] as const,
    list: (filters?: string) => [...queryKeys.songs.lists(), { filters }] as const,
    search: (query: string) => [...queryKeys.songs.all, 'search', query] as const,
    details: () => [...queryKeys.songs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.songs.details(), id] as const,
  },
  artists: {
    all: ['artists'] as const,
    songs: (name: string) => [...queryKeys.artists.all, 'songs', name] as const,
  },
  user: {
    songs: (userId?: string) => ['user', userId, 'songs'] as const,
    likedSongs: (userId?: string) => ['user', userId, 'liked-songs'] as const,
  },
};
