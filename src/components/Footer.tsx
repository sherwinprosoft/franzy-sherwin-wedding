"use client";

import { ArrowUp, CalendarDays, Heart, MapPin } from "lucide-react";
import { wedding } from "@/data/wedding";
import { Reveal } from "./animations/Reveal";
import styles from "./Footer.module.css";

const footerLinks = wedding.navItems.filter(({ href }) => href !== "#home");

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.floralAccent} aria-hidden="true" />

      <div className={styles.inner}>
        <Reveal width="100%" delay={0.08}>
          <div className={styles.closingMark} aria-hidden="true">
            <Heart size={18} fill="currentColor" strokeWidth={1.6} />
          </div>
        </Reveal>

        <Reveal width="100%" delay={0.14}>
          <p className={styles.kicker}>With love and gratitude</p>
        </Reveal>

        <Reveal width="100%" delay={0.2}>
          <p className={`${styles.names} script-balance`}>{wedding.couple.display}</p>
        </Reveal>

        <Reveal width="100%" delay={0.26}>
          <p className={styles.message}>
            We look forward to celebrating this day with the people closest to our hearts.
          </p>
        </Reveal>

        <Reveal width="100%" delay={0.32}>
          <div className={styles.rule} />
        </Reveal>

        <Reveal width="100%" delay={0.38}>
          <dl className={styles.summary} aria-label="Wedding summary">
            <div className={styles.summaryItem}>
              <dt>
                <CalendarDays size={15} strokeWidth={1.7} />
                Date
              </dt>
              <dd>{wedding.date.full}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>
                <MapPin size={15} strokeWidth={1.7} />
                Venues
              </dt>
              <dd>
                {wedding.venues.ceremony.name} <span aria-hidden="true">|</span>{" "}
                {wedding.venues.reception.name}
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal width="100%" delay={0.44}>
          <nav className={styles.footerNav} aria-label="Footer navigation">
            {footerLinks.map((item) => (
              <a key={item.href} href={item.href} className={styles.footerLink}>
                {item.label}
              </a>
            ))}
          </nav>
        </Reveal>

        <Reveal width="100%" delay={0.5}>
          <a href="#home" className={styles.backToTop} aria-label="Back to top">
            <ArrowUp size={15} strokeWidth={1.8} />
            Back to top
          </a>
        </Reveal>
      </div>
    </footer>
  );
}
