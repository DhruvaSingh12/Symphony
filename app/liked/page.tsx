"use client";

import { useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import LikedContent from "./components/LikedContent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLikedSongs } from "@/hooks/queries/useLikedSongs";
import { Skeleton } from "@/components/ui/skeleton";

const scroll_key = 'liked-scroll-position';

const LikedPage = () => {
  const { data: songs, isLoading, error } = useLikedSongs();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (isRestoringRef.current || !scrollAreaRef.current || isLoading) return;
    const savedPosition = sessionStorage.getItem(scroll_key);
    if (!savedPosition) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;

    if (viewport) {
      isRestoringRef.current = true;
      requestAnimationFrame(() => {
        viewport.scrollTop = parseInt(savedPosition, 10);
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      });
    }
  }, [isLoading]);

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (isRestoringRef.current || !scrollAreaRef.current) return;

    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (viewport) {
      sessionStorage.setItem(scroll_key, viewport.scrollTop.toString());
    }
  }, []);

  // Restore scroll position when data loads
  useEffect(() => {
    if (!isLoading && songs) {
      const timer = setTimeout(restoreScrollPosition, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, songs, restoreScrollPosition]);

  // Set up scroll listener
  useEffect(() => {
    if (!scrollAreaRef.current || isLoading) return;

    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) {
      return;
    }

    viewport.addEventListener('scroll', saveScrollPosition, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', saveScrollPosition);
    };
  }, [isLoading, saveScrollPosition]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
        <Header className="bg-transparent">
          <div className="flex items-start flex-col gap-1">
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
              ♥ Liked Songs
            </h1>
            {!isLoading && songs && (
              <div>
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </div>
            )}
          </div>
        </Header>
      </div>
      <div className="w-full overflow-hidden px-2 md:px-0 md:pr-2 mt-2 pb-2">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          {isLoading ? (
            <Card className="bg-card/60 border-border">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-card/60 border-border">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Error loading liked songs. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : (
            <LikedContent songs={songs || []} />
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default LikedPage;