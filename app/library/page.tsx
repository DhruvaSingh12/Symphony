import Library from "./components/LibraryContent"; 
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import getSongsByUserId from "@/actions/getSongsByUserId";

export const revalidate = 0;

const LibraryPage = async () => {
    const songs = await getSongsByUserId(); 

    return (
        <div className="h-full w-full space-y-4">
            <Header className="bg-transparent">
                <div className="px-2">
                    <div className="flex items-center gap-x-5">
                        <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
                            <AvatarImage src="/images/library.jpeg" alt="Library" />
                            <AvatarFallback>LB</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                                Library
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base">{songs.length} songs</p>
                        </div>
                    </div>
                </div>
            </Header>
            <Card className="bg-card/60 border-border mx-2">
                <Library songs={songs} />
            </Card>
        </div>
    );
};

export default LibraryPage;
