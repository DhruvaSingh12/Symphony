import getLikedSongs from "@/actions/getLikedSongs";
import Header from "@/components/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Sort from "@/components/Sort";
import LikedContent from "./components/LikedContent"; 

export const revalidate = 0;

const Liked = async () => {
  let songs: string | any[] = [];
  try {
    songs = await getLikedSongs();
  } catch (error) {
    console.error("Failed to fetch favourite songs:", error);
  }

  return (
    <div className="h-full w-full space-y-4">
      <Header className="bg-transparent">
        <div className="px-2">
          <div className="flex items-center gap-x-5">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
              <AvatarImage src="/images/liked.jpg" alt="Liked Songs" />
              <AvatarFallback>♥</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Liked Songs
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">{songs.length} songs</p>
            </div>
          </div>
        </div>
      </Header>
      <Card className="bg-card/60 border-border mx-2">
        <div className="px-6 py-4">
          <Sort songs={songs} ContentComponent={LikedContent} />
        </div>
      </Card>
    </div>
  );
};

export default Liked;
