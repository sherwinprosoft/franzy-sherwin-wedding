"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./WeddingAudio.module.css";

const audioSrc = "/images/Pufino%20-%20Thoughtful%20%28freetouse.com%29.mp3";
const musicVolume = 0.34;

export default function WeddingAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  const playMusic = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return false;
    }

    audio.volume = musicVolume;

    try {
      await audio.play();
      setIsPlaying(true);
      setNeedsGesture(false);
      return true;
    } catch {
      setIsPlaying(false);
      setNeedsGesture(true);
      return false;
    }
  }, []);

  useEffect(() => {
    const unlockPlayback = () => {
      void playMusic();
    };

    void playMusic();

    window.addEventListener("pointerdown", unlockPlayback, { once: true });
    window.addEventListener("keydown", unlockPlayback, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockPlayback);
      window.removeEventListener("keydown", unlockPlayback);
    };
  }, [playMusic]);

  const toggleMusic = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      void playMusic();
      return;
    }

    audio.pause();
    setIsPlaying(false);
    setNeedsGesture(false);
  };

  const label = isPlaying ? "Pause music" : needsGesture ? "Play music" : "Start music";
  const Icon = isPlaying ? Volume2 : needsGesture ? Music2 : VolumeX;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        className={`${styles.control} ${needsGesture ? styles.awaiting : ""}`}
        onClick={toggleMusic}
        aria-label={label}
        aria-pressed={isPlaying}
        title={label}
      >
        <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
        <span>{isPlaying ? "Music on" : "Play music"}</span>
      </button>
    </>
  );
}
