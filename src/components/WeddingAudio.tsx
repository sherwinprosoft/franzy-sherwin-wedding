"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./WeddingAudio.module.css";

const audioSrc = "/images/Pufino%20-%20Thoughtful%20%28freetouse.com%29.mp3";
const musicVolume = 0.34;
const musicPreferenceKey = "wedding-audio-state";

type MusicPreference = "playing" | "paused";
type WeddingAudioContextValue = {
  isPlaying: boolean;
  needsGesture: boolean;
  label: string;
  toggleMusic: () => void;
};
type WeddingAudioControlProps = {
  variant?: "floating" | "header";
};

const WeddingAudioContext = createContext<WeddingAudioContextValue | null>(null);

function saveMusicPreference(preference: MusicPreference) {
  window.localStorage.setItem(musicPreferenceKey, preference);
}

function getMusicPreference() {
  return window.localStorage.getItem(musicPreferenceKey) as MusicPreference | null;
}

function useWeddingAudio() {
  const context = useContext(WeddingAudioContext);

  if (!context) {
    throw new Error("WeddingAudioControl must be used inside WeddingAudioProvider.");
  }

  return context;
}

export function WeddingAudioProvider({ children }: { children: ReactNode }) {
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
      saveMusicPreference("playing");
      return true;
    } catch {
      setIsPlaying(false);
      setNeedsGesture(true);
      return false;
    }
  }, []);

  useEffect(() => {
    const savedPreference = getMusicPreference();

    if (savedPreference === "paused") {
      return;
    }

    const unlockPlayback = () => {
      void playMusic();
    };

    const autoplayAttempt = window.setTimeout(() => {
      void playMusic();
    }, 0);

    window.addEventListener("pointerdown", unlockPlayback, { once: true });
    window.addEventListener("keydown", unlockPlayback, { once: true });

    return () => {
      window.clearTimeout(autoplayAttempt);
      window.removeEventListener("pointerdown", unlockPlayback);
      window.removeEventListener("keydown", unlockPlayback);
    };
  }, [playMusic]);

  const toggleMusic = useCallback(() => {
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
    saveMusicPreference("paused");
  }, [playMusic]);

  const label = isPlaying ? "Pause music" : needsGesture ? "Play music" : "Start music";

  return (
    <WeddingAudioContext.Provider value={{ isPlaying, needsGesture, label, toggleMusic }}>
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {children}
    </WeddingAudioContext.Provider>
  );
}

export function WeddingAudioControl({ variant = "floating" }: WeddingAudioControlProps) {
  const { isPlaying, needsGesture, label, toggleMusic } = useWeddingAudio();
  const Icon = isPlaying ? Volume2 : needsGesture ? Music2 : VolumeX;
  const variantClass = variant === "header" ? styles.headerControl : styles.floatingControl;

  return (
    <button
      type="button"
      className={`${styles.control} ${variantClass} ${needsGesture ? styles.awaiting : ""}`}
      onClick={toggleMusic}
      aria-label={label}
      aria-pressed={isPlaying}
      title={label}
    >
      <Icon size={variant === "header" ? 18 : 17} strokeWidth={1.9} aria-hidden="true" />
      <span>{isPlaying ? "Music on" : "Play music"}</span>
    </button>
  );
}

export default function WeddingAudio() {
  return (
    <WeddingAudioControl variant="floating" />
  );
}
