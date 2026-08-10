"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { getImageProps } from "next/image";
import { useEffect, useState } from "react";
import { heroPhotos } from "@/data/photos";
import { wedding } from "@/data/wedding";
import { Reveal } from "./animations/Reveal";
import CoupleNameLockup from "./CoupleNameLockup";
import styles from "./Hero.module.css";

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = SECOND_IN_MS * 60;
const HOUR_IN_MS = MINUTE_IN_MS * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

const heroAlt = heroPhotos.desktop.alt;
const heroImageCommon = { alt: heroAlt, sizes: "100vw" };

const {
  props: { srcSet: desktopHeroSrcSet, src: desktopHeroSrc },
} = getImageProps({
  ...heroImageCommon,
  src: heroPhotos.desktop.src,
  width: heroPhotos.desktop.width,
  height: heroPhotos.desktop.height,
});

const {
  props: { srcSet: mobileHeroSrcSet, ...mobileHeroProps },
} = getImageProps({
  ...heroImageCommon,
  src: heroPhotos.mobile.src,
  width: heroPhotos.mobile.width,
  height: heroPhotos.mobile.height,
});

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdown(target: string): Countdown {
  let remaining = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(remaining / DAY_IN_MS);
  remaining -= days * DAY_IN_MS;
  const hours = Math.floor(remaining / HOUR_IN_MS);
  remaining -= hours * HOUR_IN_MS;
  const minutes = Math.floor(remaining / MINUTE_IN_MS);
  remaining -= minutes * MINUTE_IN_MS;
  const seconds = Math.floor(remaining / SECOND_IN_MS);

  return { days, hours, minutes, seconds };
}

export default function Hero() {
  const { couple, date, venues } = wedding;
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdown(date.countdownTarget));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, SECOND_IN_MS);

    return () => window.clearInterval(interval);
  }, [date.countdownTarget]);

  const weddingMonthDay = `${date.monthName} ${date.day}`;
  const eventDateLine = `${date.weekday}, ${weddingMonthDay}, ${date.year}`;
  const ceremonyVenueLine = `${venues.ceremony.name}, Baguio City`;

  return (
    <section
      id="home"
      className={`${styles.heroSection} relative flex min-h-[100svh] overflow-hidden bg-stone px-4 text-secondary sm:px-6 lg:px-8`}
    >
      <link
        rel="preload"
        as="image"
        href={desktopHeroSrc}
        imageSrcSet={desktopHeroSrcSet}
        imageSizes="100vw"
        media="(min-width: 768px)"
      />
      <link
        rel="preload"
        as="image"
        href={mobileHeroProps.src}
        imageSrcSet={mobileHeroSrcSet}
        imageSizes="100vw"
        media="(max-width: 767px)"
      />
      <picture className={styles.heroPicture}>
        <source media="(min-width: 768px)" srcSet={desktopHeroSrcSet} />
        <img
          {...mobileHeroProps}
          alt={heroAlt}
          className={styles.heroImage}
          fetchPriority="high"
          loading="eager"
          srcSet={mobileHeroSrcSet}
        />
      </picture>
      <div className={styles.imageWash} aria-hidden="true" />
      <div className={styles.verticalOverlay} aria-hidden="true" />
      <div className={styles.edgeOverlay} aria-hidden="true" />
      <div className={styles.vellumGlow} aria-hidden="true" />
      <div className={styles.bottomFade} aria-hidden="true" />

      <div
        className={`${styles.heroContent} relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center`}
      >
        <div
          className={`${styles.lockupPanel} mx-auto w-full max-w-5xl px-3 py-4 sm:px-8 sm:py-7 lg:px-10`}
        >
          <div className={styles.titleStack}>
            <Reveal delay={0.1} width="100%" yOffset={18}>
              <p className={styles.eyebrow}>
                With love and joy, we invite you to our wedding
              </p>
            </Reveal>

            <Reveal
              delay={0.25}
              duration={1}
              width="100%"
              yOffset={24}
              overflow="visible"
            >
              <h1 className={styles.coupleTitle} aria-label={couple.display}>
                <CoupleNameLockup
                  firstName="Sherwin"
                  secondName="Franzy"
                  priority
                />
              </h1>
            </Reveal>
          </div>

          <Reveal delay={0.45} width="100%" yOffset={14}>
            <div
              className={styles.invitationDetails}
              aria-label={`${date.full} at ${date.ceremonyTime}. Ceremony at ${ceremonyVenueLine}.`}
            >
              <div className={styles.dateLine}>
                <span>{eventDateLine}</span>
                <span>{date.ceremonyTime}</span>
              </div>
              <p className={styles.venue}>{ceremonyVenueLine}</p>
            </div>
          </Reveal>
        </div>

        <div className={styles.heroActions}>
          <motion.a
            href="#details"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={styles.cta}
          >
            <span>View wedding day details</span>
            <ArrowDown size={16} strokeWidth={1.8} aria-hidden="true" />
          </motion.a>
          <div
            className={styles.countdownNote}
            aria-label={
              countdown === null
                ? `Wedding countdown to ${date.full} at ${date.ceremonyTime}`
                : `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds until ${date.full} at ${date.ceremonyTime}`
            }
          >
            {countdown ? (
              <>
                <span className={styles.countdownKicker}>
                  Counting down to our wedding day
                </span>
                <span className={styles.countdownMain}>
                  <span className={styles.countdownDays}>
                    {countdown.days}
                  </span>
                  <span className={styles.countdownDaysLabel}>days to go</span>
                </span>
                <span className={styles.countdownTime}>
                  {String(countdown.hours).padStart(2, "0")} hrs /{" "}
                  {String(countdown.minutes).padStart(2, "0")} min /{" "}
                  {String(countdown.seconds).padStart(2, "0")} sec
                </span>
              </>
            ) : (
              <span className={styles.countdownLoading}>
                Counting down to the day
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
