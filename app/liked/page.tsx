import getLikedSongs from "@/actions/getLikedSongs";
import Header from "@/components/Header";
import Image from "next/image";
import Box from "@/components/Box";
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
    <div className="flex h-full w-full">
      <div
        className="
          w-full
          flex
          flex-col
          gap-y-2
          bg-black
          h-full
        "
      >
        <Box>
          <Header>
            <div className="mt-3 px-2 md:px-2">
              <div className="flex flex-row items-center gap-x-5">
                <div className="relative h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-lg">
                  <Image
                    fill
                    alt="Playlist"
                    className="object-cover rounded-lg"
                    src="/images/liked.png"
                  />
                </div>
                <div className="flex flex-col gap-y-2 mt-0 md:mt-0">
                  <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-bold">
                    Liked Songs
                  </h1>
                  <p className="text-neutral-300 text-sm md:text-base">{songs.length} songs</p>
                </div>
              </div>
            </div>
          </Header>
        </Box>
        <Box className="overflow-y-auto flex-1 h-full px-2 md:px-2">
          <div className="mb-4">
            <Sort songs={songs} ContentComponent={LikedContent} />
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Liked;
