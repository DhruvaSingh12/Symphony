"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { LyricLine } from "@/lib/lyricsUtils";
import { cn } from "@/lib/utils";

interface LyricsDisplayProps {
    lyrics: LyricLine[];
    currentTime: number;
    isPlaying: boolean;
    className?: string;
    onSeek?: (time: number) => void;
    compact?: boolean;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
    lyrics,
    currentTime,
    isPlaying,
    className,
    onSeek,
    compact = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);

    // Find the current active line
    useEffect(() => {
        let index = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (currentTime >= lyrics[i].time) {
                index = i;
            } else {
                break;
            }
        }
        setActiveLineIndex(index);
    }, [currentTime, lyrics]);

    // Scroll to the active line
    useEffect(() => {
        if (activeLineIndex !== -1 && containerRef.current) {
            const container = containerRef.current;
            const activeElement = container.querySelector(`[data-line-index="${activeLineIndex}"]`) as HTMLElement;

            if (activeElement) {
                const containerHeight = container.offsetHeight;
                const activeElementOffset = activeElement.offsetTop;
                const activeElementHeight = activeElement.offsetHeight;

                container.scrollTo({
                    top: activeElementOffset - containerHeight / 2 + activeElementHeight / 2,
                    behavior: "smooth"
                });
            }
        }
    }, [activeLineIndex]);

    if (!lyrics || lyrics.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-8 opacity-20", className)}>
                <p className="text-sm font-medium tracking-widest uppercase italic">No timed lyrics available</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "w-full h-full overflow-y-auto scrollbar-hide flex flex-col items-center py-20 px-4 md:px-8 space-y-4 md:space-y-6 select-none",
                className
            )}
        >
            {lyrics.map((line, index) => {
                const isActive = index === activeLineIndex;
                const isPast = index < activeLineIndex;
                const isFuture = index > activeLineIndex;

                return (
                    <div
                        key={index}
                        data-line-index={index}
                        onClick={() => onSeek?.(line.time)}
                        className={cn(
                            "cursor-pointer transition-all duration-500 text-center w-full max-w-2xl px-2",
                            compact ? "text-lg md:text-xl" : "text-xl md:text-4xl",
                            isActive
                                ? "text-foreground font-extrabold scale-110 opacity-100"
                                : "text-muted-foreground font-bold opacity-30 hover:opacity-60",
                            isPast && !isActive && "blur-[0.5px]",
                            isFuture && !isActive && ""
                        )}
                        style={{
                            transform: isActive ? "scale(1.05)" : "scale(1)",
                        }}
                    >
                        {line.text}
                    </div>
                );
            })}

            {/* End of song spacer */}
            <div className="h-40 shrink-0" />
        </div>
    );
};

export default LyricsDisplay;
