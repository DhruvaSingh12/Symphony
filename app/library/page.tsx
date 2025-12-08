import Library from "./components/LibraryContent"; 
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import getSongsByUserId from "@/actions/getSongsByUserId";

export const revalidate = 0;

const LibraryPage = async () => {
    const songs = await getSongsByUserId(); 

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 pt-2">
                <Header>
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
            </div>
            <div className="flex-1 overflow-hidden px-2 pb-2">
                <Card className="bg-card/60 border-border h-full overflow-auto">
                    <Library songs={songs} />
                </Card>
            </div>
        </div>
    );
};

export default LibraryPage;
