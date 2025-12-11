export interface Song {
    id: number;
    user_id: string | null;
    author: string | null;
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
    first_name?: string;  
    last_name?: string;   
    avatar_url?: string;
    gender?: string;      
    dateOfBirth?: string; 
}

export interface Playlist {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
}

export interface PlaylistSong {
    id: number;
    playlist_id: string;
    song_id: number;
    created_at: string;
}
