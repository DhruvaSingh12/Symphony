import { fetchSongsByArtist } from "@/lib/api/songs";
import ArtistDetailsClient from "./components/ArtistDetailsClient";

interface ArtistPageProps {
    params: Promise<{
        name: string;
    }>;
}

const ArtistPage = async (props: ArtistPageProps) => {
    const params = await props.params;
    const artistName = decodeURIComponent(params.name);
    const songs = await fetchSongsByArtist(artistName);

    return (
        <ArtistDetailsClient artistName={artistName} songs={songs} />
    );
};

export default ArtistPage;