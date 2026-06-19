"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import styles from "./RsvpInvitationGate.module.css";

type RsvpInvitationGateProps = {
  children: ReactNode;
  coupleName: string;
  dateLabel: string;
  householdName: string;
};

export default function RsvpInvitationGate({
  children,
  coupleName,
  dateLabel,
  householdName,
}: RsvpInvitationGateProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const openInvitation = () => {
    setIsOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-invitation-title"
            initial={shouldReduceMotion ? false : { opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.015 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.ambient} aria-hidden="true" />
            <motion.div
              className={styles.card}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.cardFrame} aria-hidden="true" />
              <motion.p
                className={styles.eyebrow}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.55 }}
              >
                Personal RSVP
              </motion.p>
              <motion.h1
                id="rsvp-invitation-title"
                className={styles.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.62 }}
              >
                You Are Invited
              </motion.h1>
              <motion.p
                className={styles.couple}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.62 }}
              >
                {coupleName}
              </motion.p>
              <motion.div
                className={styles.dateRule}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.58 }}
              >
                <span>{dateLabel}</span>
              </motion.div>
              <motion.p
                className={styles.recipient}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.54, duration: 0.58 }}
              >
                Reserved for {householdName}
              </motion.p>
              <motion.p
                className={styles.copy}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.64, duration: 0.58 }}
              >
                With joy and gratitude, Sherwin and Franzy invite you to share
                in the celebration of their wedding day.
              </motion.p>
              <motion.button
                type="button"
                className={styles.openButton}
                onClick={openInvitation}
                autoFocus
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.76, duration: 0.54 }}
              >
                Open Invitation
              </motion.button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
