import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BsPauseFill, BsPlayFill } from 'react-icons/bs';
import { AiFillStepBackward, AiFillStepForward } from 'react-icons/ai';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { IoMdRewind, IoMdFastforward } from 'react-icons/io';
import { FaRandom } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import usePlayer from '@/hooks/usePlayer';
import { Song } from '@/types';
import Box from '@/components/Box';
import MediaItem from '@/components/MediaItem';
import LikeButton from '@/components/LikeButton';
import Slider from './Slider';

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

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

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
  }, [songUrl]);

  return (
    <div className="mx-1 flex flex-row gap-x-1">
      <Box className="bg-neutral-800 h-16 items-center w-2/6 md:w-1/5">
        <div className="flex items-center gap-x-4 mb-1">
          <MediaItem data={song} />
        </div>
      </Box>
      <Box className="w-4/6 bg-neutral-800 h-16 md:w-4/5">
        <div className="flex flex-row w-full justify-center mr-2 gap-x-1 mb-1">
          <div className="flex px-1 gap-x-4 justify-center md:hidden mt-4 items-center">
            <LikeButton songId={song.id} />
          </div>
          <div className="flex px-1 gap-x-2 mt-4 justify-center items-center md:hidden">
            <FaRandom
              onClick={() => setIsShuffle((prev) => !prev)}
              size={20}
              className={`text-neutral-400 cursor-pointer hover:text-white transition ${isShuffle ? 'text-purple-400' : ''}`}
              aria-label="Shuffle"
            />
            <AiFillStepBackward
              onClick={onPlayPrevious}
              size={26}
              className="text-neutral-400 cursor-pointer hover:text-white transition"
              aria-label="Previous"
            />
            <div
              onClick={handlePlayPause}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <Icon size={20} className="text-black" />
            </div>
            <AiFillStepForward
              onClick={onPlayNext}
              size={26}
              className="text-neutral-400 cursor-pointer hover:text-white transition"
              aria-label="Next"
            />
            <FontAwesomeIcon
              icon={faRepeat}
              onClick={() => setIsRepeat((prev) => !prev)}
              size="1x"
              className={`text-neutral-400 cursor-pointer hover:text-white transition ${isRepeat ? 'text-purple-400' : ''}`}
              aria-label="Repeat"
            />
            <VolumeIcon onClick={toggleMute} className="cursor-pointer" size={24} />
          </div>
          <div className="md:flex hidden mx-3 px-1 gap-x-4 justify-center items-center">
            <LikeButton songId={song.id} />
          </div>
          <div className="hidden md:flex flex-col items-center justify-center w-[1000px] gap-x-6 max-w-[722px] mx-6">
            <div className="flex items-center justify-center gap-x-2">
              <FaRandom
                onClick={() => setIsShuffle((prev) => !prev)}
                size={20}
                className={`text-neutral-500 cursor-pointer hover:text-white transition ${isShuffle ? 'text-violet-500' : ''}`}
                aria-label="Shuffle"
              />
              <AiFillStepBackward
                onClick={onPlayPrevious}
                size={26}
                className="text-neutral-500 cursor-pointer hover:text-white transition"
                aria-label="Previous"
              />
              <IoMdRewind
                onClick={skipBackward}
                size={26}
                className="text-neutral-500 cursor-pointer hover:text-white transition"
                aria-label="Rewind 10 seconds"
              />
              <div
                onClick={handlePlayPause}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <Icon size={24} className="text-black" />
              </div>
              <IoMdFastforward
                onClick={skipForward}
                size={26}
                className="text-neutral-500 cursor-pointer hover:text-white transition"
                aria-label="Forward 10 seconds"
              />
              <AiFillStepForward
                onClick={onPlayNext}
                size={26}
                className="text-neutral-500 cursor-pointer hover:text-white transition"
                aria-label="Next"
              />
              <FontAwesomeIcon
                icon={faRepeat}
                onClick={() => setIsRepeat((prev) => !prev)}
                size="lg"
                className={`text-neutral-500 cursor-pointer hover:text-white transition ${isRepeat ? 'text-violet-500' : ''}`}
                aria-label="Repeat"
              />
            </div>
            <div
              ref={timelineRef}
              className="relative w-full mt-2 h-1 bg-neutral-600 rounded cursor-pointer"
              onClick={handleTimelineClick}
            >
              <div
                className="absolute h-full bg-violet-500 rounded"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
            <div className="w-full flex justify-between text-neutral-300 text-xs mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{duration ? formatTime(duration) : '00:00'}</span>
            </div>
          </div>
          <div className="hidden md:flex w-full justify-end items-center pr-2">
            <div
              className="flex flex-row items-center mt-2 gap-x-2 w-[120px]"
              onMouseEnter={() => setIsVolumeHovered(true)}
              onMouseLeave={() => setIsVolumeHovered(false)}
            >
              <VolumeIcon onClick={toggleMute} className="cursor-pointer" size={32} />
              <Slider value={volume} onChange={(value) => setVolume(value)} />
              {isVolumeHovered && (
                <span className="text-neutral-400 text-sm">{Math.round(volume * 100)}</span>
              )}
            </div>
          </div>
        </div>
      </Box>
      <audio ref={audioRef} src={songUrl} />
    </div>
  );
};

export default PlayerContent;

