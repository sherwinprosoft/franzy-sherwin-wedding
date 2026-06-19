"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useId, useState } from "react";
import styles from "./RsvpInvitationGate.module.css";

type RsvpInvitationGateProps = {
  children: ReactNode;
  ceremonyLocation: string;
  ceremonyName: string;
  ceremonyTime: string;
  coupleName: string;
  dateLabel: string;
  guestArrivalTime: string;
  householdName: string;
};

const REVEAL_ANIMATION_MS = 1450;

export default function RsvpInvitationGate({
  children,
  ceremonyLocation,
  ceremonyName,
  ceremonyTime,
  coupleName,
  dateLabel,
  guestArrivalTime,
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
            initial={shouldReduceMotion ? false : { opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.paperTexture} aria-hidden="true" />

            <motion.div
              className={styles.stage}
              data-opening={isOpening ? "true" : "false"}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
              animate={
                isOpening
                  ? { opacity: 0, y: -16, scale: 1.045, filter: "blur(8px)" }
                  : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
              }
              transition={{ duration: shouldReduceMotion ? 0 : 1.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className={styles.invitation}
                animate={isOpening ? { boxShadow: "0 2rem 5rem rgb(63 41 17 / 0.18)" } : {}}
                transition={{ duration: 0.9 }}
              >
                <div className={styles.frame} aria-hidden="true" />

                <p className={styles.eyebrow}>Personal RSVP</p>
                <h1 id={titleId} className={styles.title}>
                  You Are Invited
                </h1>
                <p className={styles.couple}>{coupleName}</p>

                <div className={styles.eventLine} aria-label="Wedding event summary">
                  <span>{dateLabel}</span>
                  <span>{guestArrivalTime} Guest Arrival</span>
                  <span>{ceremonyTime} Ceremony</span>
                  <span>{ceremonyName}</span>
                  <span>{ceremonyLocation}</span>
                </div>

                <p className={styles.recipient}>
                  Reserved for {householdName}
                </p>
                <p id={descriptionId} className={styles.copy}>
                  With joy and gratitude, Sherwin and Franzy invite you to share in the celebration of their wedding day.
                </p>

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
                  {isOpening ? "Opening..." : "Open Invitation"}
                </button>

                <p className={styles.timeNote}>RSVP takes about 1 minute.</p>
              </motion.div>
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
