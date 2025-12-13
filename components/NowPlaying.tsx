"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NowPlayingIndicatorProps {
    className?: string;
    barCount?: number;
}
const NowPlayingIndicator: React.FC<NowPlayingIndicatorProps> = ({
    className,
    barCount = 3
}) => {
    return (
        <div className={cn("flex items-end justify-center gap-[2px] h-4", className)}>
            {Array.from({ length: barCount }).map((_, i) => (
                <span
                    key={i}
                    className="w-[3px] bg-primary rounded-full animate-now-playing"
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        height: '100%',
                    }}
                />
            ))}
        </div>
    );
};

export default NowPlayingIndicator;
