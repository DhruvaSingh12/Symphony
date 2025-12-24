export const queryKeys = {
  songs: {
    all: ['songs'] as const,
    lists: () => [...queryKeys.songs.all, 'list'] as const,
    list: (filters?: string) => [...queryKeys.songs.lists(), { filters }] as const,
    search: (query: string) => [...queryKeys.songs.all, 'search', query] as const,
    details: () => [...queryKeys.songs.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.songs.details(), String(id)] as const,
    liked: (userId?: string) => ['liked_songs', userId] as const,
    likeStatus: (userId?: string, songId?: number | string) => ['song-like-status', userId, String(songId)] as const,
  },
  artists: {
    all: ['artists'] as const,
    songs: (name: string) => [...queryKeys.artists.all, 'songs', name] as const,
  },
  playlists: {
    all: ['playlists'] as const,
    detail: (id: string) => [...queryKeys.playlists.all, 'detail', id] as const,
    songs: (id: string) => [...queryKeys.playlists.all, 'songs', id] as const,
    user: (userId?: string) => [...queryKeys.playlists.all, 'user', userId] as const,
    collaborative: (userId?: string) => [...queryKeys.playlists.all, 'collaborative', userId] as const,
    allUser: (userId?: string) => [...queryKeys.playlists.all, 'all-user', userId] as const,
  },
  collaborators: {
    all: (playlistId: string) => ['collaborators', playlistId] as const,
    invitations: ['pending-invitations'] as const,
  },
  user: {
    details: (userId: string) => ['user-by-id', userId] as const,
    songs: (userId?: string) => ['user', userId, 'songs'] as const,
    likedSongs: (userId?: string) => ['user', userId, 'liked-songs'] as const,
  },
};