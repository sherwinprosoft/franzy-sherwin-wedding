"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Images,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { galleryPhotos } from "@/data/photos";
import Section from "./Section";
import { Reveal } from "./animations/Reveal";
import styles from "./PhotoGallery.module.css";

const INITIAL_PHOTO_COUNT = 12;

export default function PhotoGallery() {
  const [showAll, setShowAll] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const visiblePhotos = showAll
    ? galleryPhotos
    : galleryPhotos.slice(0, INITIAL_PHOTO_COUNT);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) =>
      current === null
        ? null
        : (current - 1 + galleryPhotos.length) % galleryPhotos.length,
    );
  }, []);

  const showNext = useCallback(() => {
    setSelectedIndex((current) =>
      current === null ? null : (current + 1) % galleryPhotos.length,
    );
  }, []);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const controls = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        ),
      );

      if (controls.length === 0) {
        return;
      }

      const firstControl = controls[0];
      const lastControl = controls[controls.length - 1];

      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeLightbox, selectedIndex, showNext, showPrevious]);

  const openPhoto = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = event.currentTarget;
    setSelectedIndex(index);
  };

  const keepFocusInDialog = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab" && !dialogRef.current?.contains(document.activeElement)) {
      event.preventDefault();
      closeButtonRef.current?.focus();
    }
  };

  const selectedPhoto =
    selectedIndex === null ? null : galleryPhotos[selectedIndex];

  return (
    <Section id="photos" className={styles.section}>
      <div className={styles.inner}>
        <Reveal width="100%">
          <header className={styles.heading}>
            <p className={styles.eyebrow}>Pre-Wedding Portraits</p>
            <h2 className={`${styles.title} script-balance`}>In the Baguio Mist</h2>
            <div className={styles.rule} aria-hidden="true" />
            <p className={styles.intro}>
              A collection shaped by pine trees, soft rain, and the city that
              made every frame feel quietly our own.
            </p>
          </header>
        </Reveal>

        <div id="photo-gallery-grid" className={styles.galleryGrid}>
          {visiblePhotos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              className={`${styles.galleryTile} ${
                photo.layout === "portrait"
                  ? styles.galleryTilePortrait
                  : styles.galleryTileLandscape
              }`}
              onClick={(event) => openPhoto(index, event)}
              aria-label={`Open photo ${index + 1} of ${galleryPhotos.length}: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={
                  photo.layout === "portrait"
                    ? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    : "(min-width: 1024px) 50vw, (min-width: 640px) 66vw, 100vw"
                }
                className={styles.galleryImage}
                loading="lazy"
              />
              <span className={styles.galleryIndex} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.galleryAction}>
          <button
            type="button"
            className={styles.viewAllButton}
            aria-controls="photo-gallery-grid"
            aria-expanded={showAll}
            onClick={() => setShowAll((current) => !current)}
          >
            <Images size={17} strokeWidth={1.8} aria-hidden="true" />
            {showAll ? "Show fewer photos" : "View all photos"}
            {showAll ? (
              <ChevronUp size={16} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {selectedPhoto && selectedIndex !== null ? (
        <div
          ref={dialogRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-lightbox-title"
          aria-describedby="photo-lightbox-description"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
          onKeyDown={keepFocusInDialog}
        >
          <div className={styles.lightboxPanel}>
            <h3 id="photo-lightbox-title" className={styles.srOnly}>
              Pre-wedding photo viewer
            </h3>

            <button
              ref={closeButtonRef}
              type="button"
              className={`${styles.lightboxControl} ${styles.lightboxClose}`}
              onClick={closeLightbox}
              aria-label="Close photo viewer"
              title="Close"
            >
              <X size={22} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              className={`${styles.lightboxControl} ${styles.lightboxPrevious}`}
              onClick={showPrevious}
              aria-label="View previous photo"
              title="Previous photo"
            >
              <ChevronLeft size={26} strokeWidth={1.7} />
            </button>

            <div className={styles.lightboxImageFrame}>
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                sizes="100vw"
                className={styles.lightboxImage}
                loading="eager"
                unoptimized
              />
            </div>

            <button
              type="button"
              className={`${styles.lightboxControl} ${styles.lightboxNext}`}
              onClick={showNext}
              aria-label="View next photo"
              title="Next photo"
            >
              <ChevronRight size={26} strokeWidth={1.7} />
            </button>

            <p
              id="photo-lightbox-description"
              className={styles.lightboxCaption}
              aria-live="polite"
            >
              <span>{selectedPhoto.alt}</span>
              <span>
                {selectedIndex + 1} / {galleryPhotos.length}
              </span>
            </p>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
