import { useEffect, useState } from "react";
import { Song } from "@/types";
import SongRow from "./SongRow";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import useQueueModal from "@/hooks/ui/useQueueModal";
import usePlayer from "@/hooks/ui/usePlayer";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { toast } from "react-hot-toast";
import { ListMusic } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SONG_RELATIONAL_SELECT, mapRelationalSong } from "@/lib/api/songs";

const QueueModal = () => {
    const { isOpen, onClose } = useQueueModal();
    const player = usePlayer();
    const supabaseClient = useSupabaseClient();
    const [queueSongs, setQueueSongs] = useState<Song[]>([]);
    const [nextUpSongs, setNextUpSongs] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onPlay = (id: number) => {
        player.setId(id);
    };

    useEffect(() => {
        if (isOpen) {
            const fetchSongs = async () => {
                setIsLoading(true);
                try {
                    // Identify IDs to fetch
                    const activeId = player.activeId;
                    const queueIds = player.queue;

                    let nextUpIds: number[] = [];

                    // Calculate Next Up IDs (only if not shuffled)
                    if (!player.isShuffle && player.ids.length > 0 && activeId) {
                        let referenceId = activeId;
                        if (player.playingFromQueue && player.lastContextId) {
                            referenceId = player.lastContextId;
                        }

                        const currentIndex = player.ids.findIndex(id => id === referenceId);
                        if (currentIndex !== -1) {
                            // Fetch next 20 songs
                            nextUpIds = player.ids.slice(currentIndex + 1, currentIndex + 21);
                        }
                    }

                    const uniqueIds = Array.from(new Set([
                        ...(activeId ? [activeId] : []),
                        ...queueIds,
                        ...nextUpIds
                    ]));

                    if (uniqueIds.length === 0) {
                        setQueueSongs([]);
                        setNextUpSongs([]);
                        setCurrentSong(null);
                        return;
                    }

                    const { data, error } = await supabaseClient
                        .from('songs')
                        .select(SONG_RELATIONAL_SELECT)
                        .in('id', uniqueIds);

                    if (error) {
                        toast.error(error.message);
                        return;
                    }

                    if (data) {
                        const mappedSongs = data.map(mapRelationalSong).filter((s): s is Song => !!s);

                        // Map back to sections
                        if (activeId) {
                            const current = mappedSongs.find(s => s.id === activeId);
                            setCurrentSong(current || null);
                        }

                        const qSongs = queueIds.map(id => mappedSongs.find(s => s.id === id)).filter((s): s is Song => !!s);
                        setQueueSongs(qSongs);

                        const nSongs = nextUpIds.map(id => mappedSongs.find(s => s.id === id)).filter((s): s is Song => !!s);
                        setNextUpSongs(nSongs);
                    }
                } catch (error) {
                    toast.error("Something went wrong");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchSongs();
        }
    }, [isOpen, player.queue, player.ids, player.activeId, player.isShuffle, supabaseClient, player.lastContextId, player.playingFromQueue]);

    const onChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onChange}>
            <SheetContent className="w-full sm:max-w-3xl overflow-hidden">
                <SheetHeader>
                    <SheetTitle className="flex text-lg items-center gap-2">
                        <ListMusic className="w-5 h-5" />
                        Play Queue
                    </SheetTitle>
                    <SheetDescription />
                </SheetHeader>
                <div className="w-full h-full mt-2 pb-4 overflow-auto scrollbar-hide">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center pt-20">
                            <LoadingSpinner size={32} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 px-1">
                            {/* Now Playing */}
                            {currentSong && (
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-2">Now Playing</h3>
                                    <SongRow
                                        song={currentSong}
                                        index={0}
                                        onPlay={onPlay}
                                        layout="queue"
                                        showRemove={false}
                                    />
                                </div>
                            )}

                            {/* Next In Queue (Manual) */}
                            {queueSongs.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-2">Next In Queue</h3>
                                    <div className="flex flex-col">
                                        {queueSongs.map((song, index) => (
                                            <div key={`${song.id}-${index}`} className="border-b border-border/50 last:border-b-0">
                                                <SongRow
                                                    song={song}
                                                    index={index + 1}
                                                    onPlay={onPlay}
                                                    layout="queue"
                                                    showRemove={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Next Up (Context) */}
                            {nextUpSongs.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-2">Next Up</h3>
                                    <div className="flex flex-col opacity-80">
                                        {nextUpSongs.map((song, index) => {
                                            // Correct index relative to context
                                            const currentIdx = player.ids.indexOf(player.activeId!) || 0;
                                            return (
                                                <div key={song.id} className="border-b border-border/50 last:border-b-0">
                                                    <SongRow
                                                        song={song}
                                                        index={currentIdx + index + 1}
                                                        onPlay={onPlay}
                                                        showAlbum={false}
                                                        showArtist={true}
                                                        showDuration={false}
                                                        layout="default"
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {!currentSong && queueSongs.length === 0 && nextUpSongs.length === 0 && !isLoading && (
                                <div className="flex flex-col items-center justify-center pt-20 text-muted-foreground gap-2">
                                    <ListMusic className="h-10 w-10 opacity-50" />
                                    <p>Queue is empty</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default QueueModal;