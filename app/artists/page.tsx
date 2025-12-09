import ArtistContent from "./components/ArtistContent";
import Header from "@/components/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Music } from "lucide-react";

export const revalidate = 0;

const ArtistsPage = () => {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="px-2">
                        <div className="flex items-center gap-x-5">
                            <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
                                <AvatarImage src="/images/artists.avif" alt="Artists" />
                                <AvatarFallback>
                                    <Music className="h-12 w-12" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-y-2">
                                <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                                    Artists
                                </h1>
                                <p className="text-muted-foreground text-sm md:text-base">
                                    Find your next favourite.
                                </p>
                            </div>
                        </div>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="bg-card/60 border-border h-full flex flex-col overflow-hidden">
                    <ArtistContent />
                </Card>
            </div>
        </div>
    );
};

export default ArtistsPage;
