
import React from 'react';
import ArtistContent from './components/ArtistContent';
import Header from '@/components/Header';
import Box from '@/components/Box';
import Image from 'next/image';

export const revalidate = 0;

const ArtistsPage = () => {
    return (
        <div className="
            bg-neutral-900
            rounded-lg
            h-full
            w-full
            overflow-hidden
            overflow-y-auto
        ">
            <div className="
                w-full
                flex
                flex-col
                gap-y-2
                bg-black
                h-full
            ">
                <Box>
                    <Header>
                        <div className="mt-1 px-2 md:px-2">
                            <div className="flex flex-row items-center gap-x-5">
                                <div className="relative h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-lg">
                                    <Image
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        alt="Artists"
                                        className="object-cover rounded-lg"
                                        src="/images/artists.webp"
                                    />
                                </div>
                                <div className="flex flex-col gap-y-2 mt-0 md:mt-0">
                                    <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-bold">
                                        Artists
                                    </h1>
                                    <p className="text-neutral-300 text-sm md:text-base">Find your next favourite.</p>
                                </div>
                            </div>
                        </div>
                    </Header>
                </Box>
                <Box className="overflow-y-auto flex-1 h-full">
                    <div className="mt-1 mb-4">
                        <ArtistContent />
                    </div>
                </Box>
            </div>
        </div>    );
};

export default ArtistsPage;
