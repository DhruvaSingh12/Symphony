import ArtistContent from "./components/ArtistContent";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { fetchArtists } from "@/lib/api/songs";

export const revalidate = 300; // Revalidate every 5 minutes (artists change rarely)

const ArtistsPage = async () => {
    const artists = await fetchArtists();

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-3xl font-semibold text-foreground">
                            Artists
                        </h1>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="bg-card/60 border-border h-full flex flex-col overflow-hidden">
                    <ArtistContent artists={artists} />
                </Card>
            </div>
        </div>
    );
};

export default ArtistsPage;