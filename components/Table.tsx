import React, { useState, useMemo } from 'react';
import { Song } from '@/types';
import LikeButton from '@/components/LikeButton';
import MediaItem from '@/components/MediaItem';
import AlbumModal from './AlbumModal';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

interface TableProps {
    songs: Song[];
    onPlay: (id: number) => void;
}

interface FormatRelativeDateOptions {
    month: 'short';
    day: 'numeric';
    year?: 'numeric';
}

const formatRelativeDate = (from: Date): string => {
    const currentDate = new Date();
    const timeDifferenceInSeconds = (currentDate.getTime() - from.getTime()) / 1000;
    const timeDifferenceInDays = timeDifferenceInSeconds / (24 * 60 * 60);

    if (timeDifferenceInSeconds < 60) {
        return "less than a minute ago";
    } else if (timeDifferenceInSeconds < 24 * 60 * 60) {
        const hours = Math.floor(timeDifferenceInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (timeDifferenceInDays <= 14) {
        return `${Math.floor(timeDifferenceInDays)} day${Math.floor(timeDifferenceInDays) > 1 ? 's' : ''} ago`;
    } else {
        const options: FormatRelativeDateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        if (currentDate.getFullYear() === from.getFullYear()) {
            delete options.year;
        }
        return from.toLocaleDateString(undefined, options);
    }
};


const Table: React.FC<TableProps> = ({ songs, onPlay }) => {
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [albumData, setAlbumData] = useState<{ songs: Song[] } | null>(null);


    const handleAlbumClick = (album: string) => {
        const filteredSongs = songs.filter(song => song.album === album);
        setAlbumData({ songs: filteredSongs });
        setSelectedAlbum(album);
    };

    const closeAlbumModal = () => {
        setSelectedAlbum(null);
        setAlbumData(null);
    };

    const memoizedSongs = useMemo(() => songs, [songs]);

    return (
        <div className="w-full">
            <ShadcnTable>
                <TableHeader className="sticky top-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 z-10">
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="hidden sm:table-cell w-12">#</TableHead>
                        <TableHead className="w-16"></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead className="hidden md:table-cell">Album</TableHead>
                        <TableHead className="hidden xl:table-cell">Date Added</TableHead>
                        <TableHead className="w-16">Like</TableHead>
                        <TableHead className='w-12 block md:hidden'></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {memoizedSongs.map((song, index) => (
                        <TableRow key={song.id} className="border-border hover:bg-accent/50">
                            <TableCell className="hidden sm:table-cell">{index + 1}</TableCell>
                            <TableCell className="py-3">
                                <div className="w-[48px] h-[48px]">
                                    <MediaItem
                                        data={song}
                                        onClick={onPlay}
                                    />
                                </div>
                            </TableCell>
                            <TableCell>{song.title}</TableCell>
                            <TableCell>
                                {song.artist?.map((artist, i) => (
                                    <span
                                        key={artist}
                                        className="cursor-pointer hover:text-primary transition"
                                    >
                                        {i > 0 && ', '}
                                        {artist}
                                    </span>
                                )) || 'Unknown'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {song.album && (
                                    <span
                                        className="cursor-pointer hover:text-primary transition"
                                        onClick={() => handleAlbumClick(song.album!)}
                                    >
                                        {song.album}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">{formatRelativeDate(new Date(song.created_at))}</TableCell>
                            <TableCell>
                                <LikeButton songId={song.id} />
                            </TableCell>
                            <TableCell className="block md:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {song.album && (
                                            <DropdownMenuItem onClick={() => handleAlbumClick(song.album!)}>
                                                {song.album}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem className="cursor-default">
                                            {formatRelativeDate(new Date(song.created_at))}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </ShadcnTable>
            {selectedAlbum && albumData && (
                <AlbumModal
                    album={selectedAlbum}
                    albumData={albumData}
                    onClose={closeAlbumModal}
                />
            )}
        </div>
    );
};

export default Table;