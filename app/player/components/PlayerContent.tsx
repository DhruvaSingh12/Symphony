import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Pause, Play, SkipBack, SkipForward, Rewind, FastForward, Volume2, VolumeX, Shuffle, Repeat, ListMusic } from 'lucide-react';
import usePlayer from '@/hooks/usePlayer';
import usePlaybackSettings from '@/hooks/usePlaybackSettings';
import useQueueModal from '@/hooks/useQueueModal';
import { Song } from '@/types';
import { Card } from '@/components/ui/card';
import MediaItem from '@/components/MediaItem';
import LikeButton from '@/components/LikeButton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import FullScreenPlayer from './FullScreenPlayer';
import usePlayerModal from '@/hooks/usePlayerModal';

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const playerModal = usePlayerModal();
  const queueModal = useQueueModal();
  const { autoplay, rememberVolume, volume, setVolume } = usePlaybackSettings();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const { isShuffle, isRepeat, toggleShuffle, toggleRepeat, isPlaying, setIsPlaying, togglePlayPause, activeId } = player;
  const audioRef = useRef<HTMLAudioElement>(null);

  const Icon = isPlaying ? Pause : Play;
  const VolumeIcon = volume === 0 ? VolumeX : Volume2;

  useEffect(() => {
    if (!rememberVolume) {
      setVolume(1);
    }
  }, [song.id, rememberVolume, setVolume]);


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (player.activeId && player.ids.includes(player.activeId) && !player.playingFromQueue) {
      if (player.lastContextId !== player.activeId) {
        player.setLastContextId(player.activeId);
      }
    }
  }, [player]);

  const onPlayNext = useCallback(() => {
    if (player.ids.length === 0) {
      return;
    }

    // Check Queue
    if (player.queue.length > 0) {
      if (!player.playingFromQueue && player.activeId) {
        player.setLastContextId(player.activeId);
      }
      const nextSongId = player.queue[0];
      player.setId(nextSongId);
      player.setPlayingFromQueue(true);
      player.shiftQueue();
      return;
    }

    let nextSongId;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * player.ids.length);
      nextSongId = player.ids[randomIndex];
    } else {
      let currentIndex = player.ids.findIndex((id) => id === player.activeId);

      // If playing a song not in context (e.g. from queue), resume from lastContextId
      if (player.playingFromQueue || currentIndex === -1) {
        if (player.lastContextId) {
          currentIndex = player.ids.findIndex((id) => id === player.lastContextId);
        } else {
          // Fallback if no last context
          currentIndex = -1;
        }
      }

      // If autoplay is OFF and we are at the end, do NOT wrap around.
      const isLastSong = currentIndex === player.ids.length - 1;
      if (!autoplay && isLastSong && !isRepeat) {
        setIsPlaying(false);
        return;
      }

      const nextIndex = (currentIndex + 1) % player.ids.length;
      nextSongId = player.ids[nextIndex];
    }

    player.setId(nextSongId);
  }, [player, isShuffle, autoplay, isRepeat, setIsPlaying]);

  const onPlayPrevious = useCallback(() => {
    if (player.ids.length === 0) {
      return;
    }

    let currentIndex = player.ids.findIndex((id) => id === player.activeId);

    // Fallback if current song detached
    if (player.playingFromQueue || currentIndex === -1) {
      if (player.lastContextId) {
        currentIndex = player.ids.findIndex((id) => id === player.lastContextId);
      }
    }

    const previousSongId = player.ids[(currentIndex - 1 + player.ids.length) % player.ids.length];

    player.setId(previousSongId);
  }, [player]);

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(currentTime + 10, duration || currentTime);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(currentTime - 10, 0);
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = () => {
    togglePlayPause();
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
      if (isPlaying) {
        audioElement.play().catch(() => setIsPlaying(false));
      }
    };

    const handleTimeUpdate = () => {
      const current = audioElement.currentTime;
      setCurrentTime(current);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audioElement.currentTime = 0;
        audioElement.play();
      } else {
        if (!autoplay && player.ids.indexOf(player.activeId!) === player.ids.length - 1) {
          setIsPlaying(false);
        } else {
          onPlayNext();
        }
      }
    };

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, onPlayNext, isRepeat, setIsPlaying, duration, autoplay, player.ids, player.activeId, isPlaying]);

  // Sync audio playback with global isPlaying state
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying && audioElement.paused) {
      audioElement.play();
    } else if (!isPlaying && !audioElement.paused) {
      audioElement.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement && isPlaying) {
      audioElement.play();
    }
  }, [songUrl, isPlaying]);

  return (
    <TooltipProvider>
      <div className="flex gap-2 mx-1">
        {/* Left Card: Song Info - Hidden on mobile */}
        <Card className="bg-card border-border h-16 hidden md:flex items-center w-1/5 p-2">
          <div className="flex items-center gap-x-2 w-full">
            <MediaItem data={song} onClick={() => { }} />
          </div>
        </Card>

        {/* Right Card: Controls - Full width on mobile */}
        <Card className="bg-card border-border w-full md:w-4/5 h-16 p-2">
          {/* Mobile View */}
          <div className="flex md:hidden h-full w-full items-center justify-between px-2">
            <div
              className="flex items-center gap-x-3 flex-1 cursor-pointer overflow-hidden"
              onClick={playerModal.onOpen}
            >
              <MediaItem data={song} onClick={() => { }} />
            </div>

            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-foreground text-background shrink-0 ml-2"
              onClick={handlePlayPause}
            >
              <Icon className="h-4 w-4 fill-background" />
            </Button>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex h-full w-full items-center justify-between px-4">
            {/* Left: Like Button */}
            <div className="flex items-center w-[80px]">
              <LikeButton songId={song.id} />
            </div>

            {/* Center: Controls + Progress */}
            <div className="flex flex-col items-center justify-center flex-1 max-w-[600px]">
              <div className="flex items-center gap-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleShuffle}
                      className={cn("text-muted-foreground rounded-full hover:text-foreground transition", isShuffle && "text-primary bg-primary/10")}
                    >
                      <Shuffle className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Shuffle</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onPlayPrevious} className="text-muted-foreground hover:text-foreground rounded-full transition">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={skipBackward} className="text-muted-foreground hover:text-foreground rounded-full transition">
                      <Rewind className="h-2 w-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>-10s</TooltipContent>
                </Tooltip>

                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full bg-foreground text-background hover:scale-110 transition"
                  onClick={handlePlayPause}
                >
                  <Icon className="h-4 w-4 fill-background" />
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={skipForward} className="text-muted-foreground hover:text-foreground rounded-full transition">
                      <FastForward className="h-2 w-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>+10s</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onPlayNext} className="text-muted-foreground rounded-full hover:text-foreground transition">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRepeat}
                      className={cn("text-muted-foreground rounded-full hover:text-foreground transition", isRepeat && "text-primary bg-primary/10")}
                    >
                      <Repeat className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Repeat</TooltipContent>
                </Tooltip>
              </div>

              {/* Progress Bar */}
              <div className="flex w-full items-center gap-x-2">
                <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 bg-background/80 rounded-full px-1.5 py-1 border border-border/20">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={(value) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = value[0];
                        setCurrentTime(value[0]);
                      }
                    }}
                    className="w-full cursor-pointer [&_[data-radix-slider-track]]:h-1.5 [&_[data-radix-slider-track]]:bg-muted/50 [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:h-2.5 [&_[data-radix-slider-thumb]]:w-2.5 [&_[data-radix-slider-thumb]]:border-background [&_[data-radix-slider-thumb]]:opacity-0 [&_[data-radix-slider-thumb]]:hover:opacity-100 [&:hover_[data-radix-slider-thumb]]:opacity-100 [&_[data-radix-slider-thumb]]:transition-opacity"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-7 text-left tabular-nums">
                  {duration ? formatTime(duration) : '0:00'}
                </span>
              </div>
            </div>

            {/* Right: Volume */}
            <div className="flex items-center justify-end w-[150px] gap-x-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-muted-foreground px-2 rounded-full hover:text-foreground transition">
                <VolumeIcon className="h-5 w-5" />
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={(value) => setVolume(value[0])}
                className="w-16 cursor-pointer [&_[data-radix-slider-track]]:h-1.5 [&_[data-radix-slider-track]]:bg-muted/30 [&_[data-radix-slider-track]]:rounded-full [&_[data-radix-slider-range]]:bg-gradient-to-r [&_[data-radix-slider-range]]:from-violet-500 [&_[data-radix-slider-range]]:to-purple-400 [&_[data-radix-slider-thumb]]:h-3 [&_[data-radix-slider-thumb]]:w-3 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-violet-500 [&_[data-radix-slider-thumb]]:shadow-sm"
              />
              <span className="text-[10px] text-muted-foreground w-6 tabular-nums">
                {Math.round(volume * 100)}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => queueModal.onOpen()} className="text-muted-foreground px-2 rounded-full hover:text-foreground transition">
                    <ListMusic className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Queue</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Card>

        <audio ref={audioRef} src={songUrl} />

        <FullScreenPlayer
          song={song}
          songUrl={songUrl}
          currentTime={currentTime}
          duration={duration}
          audioRef={audioRef}
          togglePlayPause={handlePlayPause}
          onPlayNext={onPlayNext}
          onPlayPrevious={onPlayPrevious}
          formatTime={formatTime}
        />
      </div>
    </TooltipProvider>
  );
};


export default PlayerContent;