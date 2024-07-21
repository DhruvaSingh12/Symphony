"use client";

import React from 'react';
import { Song } from '@/types';
import Table from '@/components/Table';
import useOnPlay from '@/hooks/useOnPlay';

interface SearchContentProps {
    songs: Song[];
}

const SearchContent: React.FC<SearchContentProps> = ({ songs }) => {
    const onPlay = useOnPlay(songs);

    if (songs.length === 0) {
        return (
            <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
                Uh oh!! Worry not I am expanding the library and will have that title very soon. Stay Updated!
            </div>
        );
    }

    return (
        <Table songs={songs} onPlay={onPlay} />
    );
};

export default SearchContent;
