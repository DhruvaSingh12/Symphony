"use client";

import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';
import Image from 'next/image';

interface PreviewSectionProps {
    imagePreview: string | null;
    title: string;
    artists: string[];
    album: string;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
    imagePreview,
    title,
    artists,
    album
}) => {
    return (
        <div className="sticky top-3 pb-4">
            <Card className="bg-card border border-border overflow-hidden w-full max-w-sm mx-auto p-4 rounded-xl group relative">
                <div className="relative aspect-square w-full rounded-md overflow-hidden bg-background mb-4 flex items-center justify-center">
                    {imagePreview ? (
                        <Image
                            src={imagePreview}
                            alt="Cover Preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <Music className="w-20 h-20 text-muted-foreground" />
                    )}
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-xl truncate">
                        {title || "Untitled Track"}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                        {artists.length > 0 ? artists.join(", ") : "Unknown Artist"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {album || "Unknown Album"}
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default PreviewSection;
