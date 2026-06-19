"use client";

import {
  Camera,
  Clock,
  ExternalLink,
  MapPin,
  Utensils,
} from "lucide-react";
import { wedding } from "@/data/wedding";
import Section from "./Section";
import { Reveal } from "./animations/Reveal";
import styles from "./Details.module.css";

const detailCards = [
  {
    key: "ceremony",
    icon: MapPin,
    eyebrow: wedding.venues.ceremony.label,
    title: wedding.venues.ceremony.name,
    time: wedding.venues.ceremony.time,
    address: wedding.venues.ceremony.address,
    mapUrl: wedding.venues.ceremony.mapUrl,
    cta: "Open Ceremony Map",
  },
  {
    key: "reception",
    icon: Utensils,
    eyebrow: wedding.venues.reception.label,
    title: wedding.venues.reception.name,
    time: wedding.venues.reception.time,
    address: wedding.venues.reception.address,
    mapUrl: wedding.venues.reception.mapUrl,
    cta: "Open Reception Map",
  },
];

const guestEssentials = [
  {
    icon: Camera,
    label: wedding.preparationShoot.time,
    title: wedding.preparationShoot.title,
    description: `For ${wedding.preparationShoot.audience} only. ${wedding.preparationShoot.status}.`,
  },
  {
    icon: Clock,
    label: wedding.guestArrival.time,
    title: wedding.guestArrival.title,
    description: wedding.guestArrival.description,
  },
  {
    icon: MapPin,
    label: "2:00 PM",
    title: "Ceremony",
    description: "Wedding ceremony begins.",
  },
  {
    icon: Utensils,
    label: "After Ceremony",
    title: "Reception & Dinner",
    description: "Reception and dinner to follow immediately after the ceremony.",
  },
];

export default function Details() {
  return (
    <Section id="details" className={styles.section}>
      <div className={styles.inner}>
        <Reveal width="100%">
          <div className={styles.heading}>
            <p className={styles.eyebrow}>
              The Wedding Day
            </p>
            <h2 className={`${styles.title} script-balance`}>
              Ceremony & Reception
            </h2>
            <div className={styles.rule} />
            <p className={styles.intro}>
              Please join us in Baguio for our wedding ceremony at St. John Don
              Bosco Parish, followed by the reception at Craft 1945.
            </p>
          </div>
        </Reveal>

        <Reveal width="100%" delay={0.08}>
          <section className={styles.schedulePanel} aria-labelledby="day-schedule-heading">
            <div className={styles.scheduleIntro}>
              <p className={styles.kicker}>Day at a Glance</p>
              <h3 id="day-schedule-heading" className={styles.scheduleTitle}>
                Wedding Day Timeline
              </h3>
            </div>
            <ol className={styles.scheduleList}>
              {guestEssentials.map(({ icon: Icon, label, title, description }) => (
                <li key={label} className={styles.scheduleItem}>
                  <span className={styles.scheduleMark} aria-hidden="true">
                    <Icon size={14} strokeWidth={1.7} />
                  </span>
                  <span className={styles.scheduleCopy}>
                    <span className={styles.scheduleTime}>{label}</span>
                    <span className={styles.scheduleName}>{title}</span>
                    <span className={styles.scheduleText}>{description}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <div className={styles.cardGrid}>
          {detailCards.map(({ key, icon: Icon, eyebrow, title, time, address, mapUrl, cta }) => (
            <Reveal
              key={key}
              width="100%"
              className={styles.venueReveal}
              contentClassName={styles.venueRevealContent}
            >
              <article
                className={`${styles.venuePanel} ${
                  key === "ceremony" ? styles.ceremonyPanel : styles.receptionPanel
                }`}
              >
                <div className={styles.cardKicker}>
                  <span className={styles.venueMark} aria-hidden="true">
                    <Icon size={14} strokeWidth={1.7} />
                  </span>
                  <p className={styles.cardEyebrow}>
                    {eyebrow}
                  </p>
                </div>
                <h3 className={`${styles.venueTitle} script-balance`}>
                  {title}
                </h3>
                <dl className={styles.detailList}>
                  <div className={styles.detailItem}>
                    <dt className={styles.detailLabel}>Time</dt>
                    <dd className={styles.detailText}>{time}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt className={styles.detailLabel}>Address</dt>
                    <dd className={styles.detailText}>{address}</dd>
                  </div>
                </dl>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.mapButton}
                  aria-label={`${cta} in a new tab`}
                >
                  {cta}
                  <ExternalLink size={14} strokeWidth={1.7} />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
