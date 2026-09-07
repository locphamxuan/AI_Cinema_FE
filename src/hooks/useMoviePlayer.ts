'use client';

import { useState } from 'react';

export interface PlayerSettings {
  ambientLight: boolean;
  autoPlayNext: boolean;
  quality: string;
}

export function useMoviePlayer(initialQuality = '4K UHD') {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [settings, setSettings] = useState<PlayerSettings>({
    ambientLight: true,
    autoPlayNext: true,
    quality: initialQuality,
  });

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleMute = () => setIsMuted((prev) => !prev);
  const toggleAmbient = () => setSettings((prev) => ({ ...prev, ambientLight: !prev.ambientLight }));
  const setQuality = (quality: string) => setSettings((prev) => ({ ...prev, quality }));

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    settings,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    togglePlay,
    toggleMute,
    toggleAmbient,
    setQuality,
  };
}
