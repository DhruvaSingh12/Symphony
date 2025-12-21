export interface Song {
    id: number;
    user_id: string | null;
    artist: string[] | null;
    title: string | null;
    song_path: string | null;
    image_path: string | null;
    created_at: string | null;
    updated_at: string | null;
    album: string | null;
    duration: number | null;
}

export interface UserDetails {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    gender: string | null;      
    dateOfBirth: string | null; 
}

export interface Playlist {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    image_path: string | null;
    created_at: string | null;
}

export interface PlaylistSong {
    id: number;
    playlist_id: string;
    song_id: number;
    added_by: string | null;
    created_at: string | null;
}

export interface PlaylistCollaborator {
    id: string;
    playlist_id: string;
    user_id: string;
    invited_by: string;
    invited_at: string;
    accepted_at: string | null;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string | null;
    user: UserDetails | null; 
    playlist: Playlist | null;
}

export interface PlaylistWithCollaborators extends Playlist {
    songs: Song[];
    collaborators: PlaylistCollaborator[];
    isOwner: boolean | null;
}

export interface PlaylistSongWithAuthor extends PlaylistSong {
    added_by_user: UserDetails | null; 
    song: Song | null; 
}