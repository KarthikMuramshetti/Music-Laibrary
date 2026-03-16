import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { getFileUrl } from '../services/api';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(new Audio());

  const currentSong = queue[currentIndex] || null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    audio.src = getFileUrl(currentSong.filePath);
    audio.volume = volume;
    if (isPlaying) audio.play().catch(() => {});
    audio.onended = handleEnded;
    audio.ontimeupdate = () => setProgress(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    return () => { audio.onended = null; audio.ontimeupdate = null; audio.onloadedmetadata = null; };
  }, [currentIndex, queue]);

  useEffect(() => { audioRef.current.volume = volume; }, [volume]);

  const handleEnded = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };

  const playQueue = (songs, startIndex = 0) => {
    setQueue(songs);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
    const audio = audioRef.current;
    audio.src = getFileUrl(songs[startIndex]?.filePath);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const playSong = (song) => {
    setQueue([song]);
    setCurrentIndex(0);
    setIsPlaying(true);
    const audio = audioRef.current;
    audio.src = getFileUrl(song.filePath);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    const nextIndex = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
    const audio = audioRef.current;
    audio.src = getFileUrl(queue[nextIndex]?.filePath);
    audio.play().catch(() => {});
  };

  const playPrev = () => {
    if (queue.length === 0) return;
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
    const audio = audioRef.current;
    audio.src = getFileUrl(queue[prevIndex]?.filePath);
    audio.play().catch(() => {});
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, isRepeat, isShuffle, progress, duration, volume, queue,
      playQueue, playSong, togglePlay, playNext, playPrev, seek,
      setVolume, setIsRepeat, setIsShuffle,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
