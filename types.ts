export interface Song {
    id: number;
    user_id: string | null;
    artist: string[] | null;
    title: string | null;
    song_path: string | null;
    image_path: string | null;
    created_at: string;
    updated_at: string | null;
    album: string | null;
    duration: number | null;
}

export interface UserDetails {
    id: string;
    full_name?: string;
    avatar_url?: string;
    gender?: string;      
    dateOfBirth?: string; 
}

export interface Playlist {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    image_path?: string;
    created_at: string;
}

export interface PlaylistSong {
    id: number;
    playlist_id: string;
    song_id: number;
    added_by?: string;
    created_at: string;
}

export interface PlaylistCollaborator {
    id: string;
    playlist_id: string;
    user_id: string;
    invited_by: string;
    invited_at: string;
    accepted_at?: string;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string;
    user?: UserDetails; 
}

export interface PlaylistWithCollaborators extends Playlist {
    songs: Song[];
    collaborators: PlaylistCollaborator[];
    isOwner?: boolean;
}

export interface PlaylistSongWithAuthor extends PlaylistSong {
    added_by_user?: UserDetails; 
    song?: Song; 
}