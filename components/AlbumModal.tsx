"use client";

import { useEffect, useState } from "react";
import { Song } from "@/types";
import SongRow from "./SongRow";
import useOnPlay from "@/hooks/useOnPlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAlbumModal from "@/hooks/useAlbumModal";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/LoadingSpinner";

const AlbumModal = () => {
  const { isOpen, onClose, albumName } = useAlbumModal();
  const supabaseClient = useSupabaseClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onPlay = useOnPlay(songs, 'album', albumName ?? '');

  useEffect(() => {
    if (isOpen && albumName) {
      const fetchSongs = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabaseClient
            .from('songs')
            .select('*')
            .eq('album', albumName)
            .order('id', { ascending: true });

          if (error) {
            toast.error(error.message);
            return;
          }

          if (data) {
            const mappedSongs: Song[] = data.map(item => ({
              id: item.id,
              user_id: item.user_id,
              author: item.artist?.[0] ?? null,
              artist: item.artist ?? [],
              title: item.title,
              song_path: item.song_path,
              image_path: item.image_path,
              created_at: item.created_at,
              updated_at: item.created_at,
              album: item.album,
              duration: item.duration
            }));
            setSongs(mappedSongs);
          }
        } 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch (_error) {
          toast.error("Something went wrong");
        } finally {
          setIsLoading(false);
        }
      };

      fetchSongs();
    } else {
      setSongs([]);
    }
  }, [isOpen, albumName, supabaseClient]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  if (!albumName) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex text-lg items-center gap-2">
            {albumName}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="w-full h-[calc(100vh-8rem)] mt-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center pt-20">
              <LoadingSpinner size={32} />
            </div>
          ) : (
            <div className="flex flex-col">
              {songs.map((song, index) => (
                <div key={song.id} className="border-b border-border/50 last:border-b-0">
                  <SongRow
                    song={song}
                    index={index}
                    onPlay={onPlay}
                    showAlbum={false}
                  />
                </div>
              ))}
              {songs.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground pt-10">
                  No songs found for this album.
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AlbumModal;