
import React from 'react';
import ArtistContent from './components/ArtistContent';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';

export const revalidate = 0;

const ArtistsPage = () => {
    return (
        <div className="h-full w-full space-y-4">
            <Header className="bg-transparent">
                <div className="px-2">
                    <div className="flex items-center gap-x-5">
                        <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
                            <AvatarImage src="/images/artists.avif" alt="Artists" />
                            <AvatarFallback><Music className="h-12 w-12" /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                                Artists
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base">Find your next favourite.</p>
                        </div>
                    </div>
                </div>
            </Header>
            <Card className="bg-card/60 border-border mx-2">
                <ArtistContent />
            </Card>
        </div>    
    );
};

export default ArtistsPage;
