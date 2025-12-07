
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Pause, Play, SkipBack, SkipForward, Rewind, FastForward, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import usePlayer from '@/hooks/usePlayer';
import { Song } from '@/types';
import { Card } from '@/components/ui/card';
import MediaItem from '@/components/MediaItem';
import LikeButton from '@/components/LikeButton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Slider from './Slider';
import { cn } from '@/lib/utils';

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const Icon = isPlaying ? Pause : Play;
  const VolumeIcon = volume === 0 ? VolumeX : Volume2;

  const onPlayNext = useCallback(() => {
    if (player.ids.length === 0) {
      return;
    }

    let nextSongId;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * player.ids.length);
      nextSongId = player.ids[randomIndex];
    } else {
      const currentIndex = player.ids.findIndex((id) => id === player.activeId);
      nextSongId = player.ids[(currentIndex + 1) % player.ids.length];
    }

    player.setId(nextSongId);
  }, [player, isShuffle]);

  const onPlayPrevious = useCallback(() => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
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
    setVolume(volume === 0 ? 1 : 0);
    if (audioRef.current) {
      audioRef.current.volume = volume === 0 ? 1 : 0;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (audioElement.paused) {
      audioElement.play();
      setIsPlaying(true);
    } else {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !timelineRef.current) return;

    const timelineWidth = timelineRef.current.clientWidth;
    const clickX = event.nativeEvent.offsetX;
    const newTime = (clickX / timelineWidth) * (duration || 0);

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
      audioElement.play(); 
      setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audioElement.currentTime = 0;
        audioElement.play();
      } else {
        setIsPlaying(false);
        onPlayNext();
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
  }, [audioRef, onPlayNext, isRepeat]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement && isPlaying) {
      audioElement.play();
    }
  }, [songUrl, isPlaying]);

  return (
    <TooltipProvider>
      <div className="flex gap-2 mx-1">
        <Card className="bg-card border-border h-16 flex items-center w-2/6 md:w-1/5 p-2">
          <MediaItem data={song} onClick={() => {}} />
        </Card>
        <Card className="bg-card border-border w-4/6 md:w-4/5 h-16 p-2">
          <div className="flex w-full justify-center items-center h-full">
            <div className="flex gap-2 justify-center items-center md:hidden">
              <LikeButton songId={song.id} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsShuffle((prev) => !prev)}
                    className={cn(isShuffle && "text-primary")}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Shuffle</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onPlayPrevious}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous</TooltipContent>
              </Tooltip>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={handlePlayPause}
              >
                <Icon className="h-4 w-4" />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onPlayNext}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRepeat((prev) => !prev)}
                    className={cn(isRepeat && "text-primary")}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Repeat</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                <VolumeIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="hidden md:flex items-center gap-4 w-full px-4">
              <LikeButton songId={song.id} />
              <div className="flex flex-col items-center justify-center flex-1 max-w-[722px]">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsShuffle((prev) => !prev)}
                        className={cn(isShuffle && "text-primary")}
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Shuffle</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onPlayPrevious}>
                        <SkipBack className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Previous</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={skipBackward}>
                        <Rewind className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rewind 10s</TooltipContent>
                  </Tooltip>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={handlePlayPause}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={skipForward}>
                        <FastForward className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Forward 10s</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onPlayNext}>
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Next</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsRepeat((prev) => !prev)}
                        className={cn(isRepeat && "text-primary")}
                      >
                        <Repeat className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Repeat</TooltipContent>
                  </Tooltip>
                </div>
                <div
                  ref={timelineRef}
                  className="relative w-full mt-2 h-1 bg-muted rounded cursor-pointer"
                  onClick={handleTimelineClick}
                >
                  <div
                    className="absolute h-full bg-primary rounded"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
                <div className="w-full flex justify-between text-muted-foreground text-xs mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration ? formatTime(duration) : '00:00'}</span>
                </div>
              </div>
              <div
                className="flex items-center gap-2 w-[120px]"
                onMouseEnter={() => setIsVolumeHovered(true)}
                onMouseLeave={() => setIsVolumeHovered(false)}
              >
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  <VolumeIcon className="h-5 w-5" />
                </Button>
                <Slider value={volume} onChange={(value) => setVolume(value)} />
                {isVolumeHovered && (
                  <span className="text-muted-foreground text-sm">{Math.round(volume * 100)}</span>
                )}
              </div>
            </div>
          </div>
        </Card>
        <audio ref={audioRef} src={songUrl} />
      </div>
    </TooltipProvider>
  );
};

export default PlayerContent;
