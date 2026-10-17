"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { CalendarDays, Clock3, MailOpen, MapPin } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import type { PartyCallTimeGroup } from "@/lib/wedding-schedule";
import CoupleNameLockup from "./CoupleNameLockup";
import WeddingBrandMark from "./WeddingBrandMark";
import styles from "./RsvpInvitationGate.module.css";

type RsvpInvitationGateProps = {
  brideName: string;
  children: ReactNode;
  ceremonyLocation: string;
  ceremonyName: string;
  ceremonyTime: string;
  callTimeGroups: PartyCallTimeGroup[];
  coupleName: string;
  dateLabel: string;
  groomName: string;
  householdName: string;
};

const REVEAL_ANIMATION_MS = 1450;

export default function RsvpInvitationGate({
  brideName,
  children,
  ceremonyLocation,
  ceremonyName,
  ceremonyTime,
  callTimeGroups,
  coupleName,
  dateLabel,
  groomName,
  householdName,
}: RsvpInvitationGateProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpening, setIsOpening] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (isRevealed) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isRevealed]);

  useEffect(() => {
    if (!isOpening || shouldReduceMotion) {
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setIsRevealed(true);
    }, REVEAL_ANIMATION_MS);

    return () => window.clearTimeout(revealTimer);
  }, [isOpening, shouldReduceMotion]);

  useEffect(() => {
    if (!isRevealed) {
      return;
    }

    window.requestAnimationFrame(() => {
      const nextFocusTarget = document.querySelector<HTMLElement>("[data-rsvp-focus]");
      nextFocusTarget?.focus();
    });
  }, [isRevealed]);

  const openInvitation = () => {
    if (isOpening) {
      return;
    }

    if (shouldReduceMotion) {
      setIsRevealed(true);
      return;
    }

    setIsOpening(true);
  };

  return (
    <>
      <AnimatePresence>
        {!isRevealed ? (
          <motion.div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.backdrop}
              aria-hidden="true"
              animate={isOpening ? { scale: 1.055 } : { scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 1.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/images/prewedding/tcs00454.webp"
                alt=""
                fill
                priority
                sizes="100vw"
                className={styles.desktopPhoto}
              />
              <Image
                src="/images/prewedding/tcs00457.webp"
                alt=""
                fill
                priority
                sizes="100vw"
                className={styles.mobilePhoto}
              />
            </motion.div>
            <div className={styles.photoWash} aria-hidden="true" />
            <div className={styles.paperTexture} aria-hidden="true" />

            <motion.div
              className={styles.stage}
              data-opening={isOpening ? "true" : "false"}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={
                isOpening
                  ? { opacity: 0, y: -16, scale: 1.045, filter: "blur(8px)" }
                  : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
              }
              transition={{ duration: shouldReduceMotion ? 0 : 1.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.frame} aria-hidden="true" />

              <header className={styles.masthead}>
                <p className={styles.eyebrow}>A personal wedding invitation</p>
                <div className={styles.monogram} aria-hidden="true">
                  <WeddingBrandMark
                    asset="monogram"
                    tone="light"
                    className={styles.monogramMark}
                    priority
                  />
                </div>
              </header>

              <div className={styles.invitationCopy}>
                <p className={styles.preTitle}>Together with their families</p>
                <h1
                  id={titleId}
                  className={styles.title}
                  aria-label={coupleName}
                >
                  <CoupleNameLockup
                    firstName={groomName}
                    secondName={brideName}
                    priority
                  />
                </h1>
                <p id={descriptionId} className={styles.copy}>
                  joyfully invite you to celebrate their wedding day
                </p>
              </div>

              <div className={styles.eventLine} aria-label="Wedding event summary">
                <span><CalendarDays aria-hidden="true" />{dateLabel}</span>
                <span><Clock3 aria-hidden="true" />{ceremonyTime} ceremony</span>
                <span><MapPin aria-hidden="true" />{ceremonyName}, {ceremonyLocation}</span>
              </div>

              <section className={styles.callTimes} aria-label="Personal call times">
                <p>{callTimeGroups.length > 1 ? "Your household call times" : "Your personal call time"}</p>
                <div className={styles.callTimeList}>
                  {callTimeGroups.map((group) => (
                    <div key={group.key}>
                      <strong>{group.time}</strong>
                      <span>{group.title}</span>
                      <small>{group.guestNames.join(" · ")}</small>
                    </div>
                  ))}
                </div>
              </section>

              <footer className={styles.invitationFooter}>
                <div className={styles.recipient}>
                  <span>Reserved with love for</span>
                  <strong>{householdName}</strong>
                </div>

                <button
                  type="button"
                  className={styles.openButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    openInvitation();
                  }}
                  disabled={isOpening}
                  autoFocus
                >
                  <MailOpen aria-hidden="true" />
                  <span>{isOpening ? "Opening invitation..." : "View Your Invitation"}</span>
                </button>

                <p className={styles.timeNote}>Your response takes about one minute.</p>
              </footer>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
