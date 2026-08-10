import Link from "next/link";
import { getImageProps } from "next/image";
import { ArrowDown, CalendarDays, Clock3, Link2, MapPin } from "lucide-react";
import WeddingBrandMark from "@/components/WeddingBrandMark";
import { wedding } from "@/data/wedding";
import { getPublicRsvpList } from "@/lib/rsvp";
import styles from "./RsvpPage.module.css";

const publicRsvpPhotoAlt =
  "Sherwin and Franzy wearing denim during their Baguio pre-wedding portrait.";

const {
  props: { srcSet: publicDesktopPhotoSrcSet },
} = getImageProps({
  src: "/images/prewedding/tcs00454.webp",
  alt: publicRsvpPhotoAlt,
  width: 1800,
  height: 1200,
  sizes: "100vw",
  priority: true,
});

const {
  props: { srcSet: publicMobilePhotoSrcSet, ...publicMobilePhotoProps },
} = getImageProps({
  src: "/images/prewedding/tcs00405.webp",
  alt: publicRsvpPhotoAlt,
  width: 1200,
  height: 1800,
  sizes: "100vw",
  priority: true,
});

export const metadata = {
  title: `RSVP | ${wedding.couple.display}`,
  description: `RSVP information for ${wedding.couple.display}.`,
};

export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const publicList = await getPublicRsvpList();
  const confirmedCount = publicList.attendees.length;
  const attendingHouseholds = Array.from(
    publicList.attendees.reduce((households, guest) => {
      const familyGuests = households.get(guest.householdName) || [];
      familyGuests.push(guest);
      households.set(guest.householdName, familyGuests);
      return households;
    }, new Map<string, typeof publicList.attendees>()),
  );

  return (
    <section className={`${styles.section} ${styles.publicSection}`}>
      <div className={styles.floralWash} aria-hidden="true" />
      <div className={styles.publicInner}>
        <header className={styles.publicHero}>
          <div className={styles.publicHeroPhoto}>
            <picture>
              <source media="(min-width: 700px)" srcSet={publicDesktopPhotoSrcSet} />
              <img
                {...publicMobilePhotoProps}
                alt={publicRsvpPhotoAlt}
                srcSet={publicMobilePhotoSrcSet}
              />
            </picture>
          </div>

          <div className={styles.publicHeroContent}>
            <WeddingBrandMark
              asset="monogram"
              tone="light"
              className={styles.publicBrandMark}
              priority
            />
            <p className={styles.eyebrow}>Confirmed Guest List · Wedding RSVP</p>
            <h1 className={styles.publicTitle}>Together in Baguio</h1>
            <p className={styles.intro}>
              Our favorite people, gathering in one place to share the beginning
              of our married life.
            </p>

            <div className={styles.publicEventFacts} aria-label="Wedding details">
              <span><CalendarDays aria-hidden="true" />{wedding.date.full}</span>
              <span><Clock3 aria-hidden="true" />{wedding.guestArrival.time} general arrival</span>
              <span><MapPin aria-hidden="true" />{wedding.venues.ceremony.name}</span>
            </div>

            <div className={styles.publicHeroActions}>
              <a href="#attendee-list-title" className={styles.publicHeroCta}>
                <span>View confirmed guest list</span>
                <ArrowDown aria-hidden="true" />
              </a>
              <div
                className={styles.publicHeroStatus}
                aria-label={`${confirmedCount} confirmed guests across ${publicList.confirmedHouseholds} invitation parties`}
              >
                <span>Celebration so far</span>
                <div>
                  <strong>{confirmedCount}</strong>
                  <p>Guests confirmed</p>
                </div>
                <small>{publicList.confirmedHouseholds} invitation parties</small>
              </div>
            </div>
          </div>
        </header>

        <section className={styles.guestRollBand} aria-labelledby="attendee-list-title">
          <div className={styles.guestRollInner}>
            <header className={styles.guestRollHeader}>
              <div>
                <p className={styles.eyebrow}>Confirmed Attendance</p>
                <h2 id="attendee-list-title">Celebrating With Us</h2>
                <p>A family-by-family roll of everyone joining our wedding day.</p>
              </div>

            </header>

            {publicList.unavailable ? (
              <p className={styles.noticeText}>
                The attending guest list is temporarily unavailable or incomplete.
                Please check again later.
              </p>
            ) : null}

            {confirmedCount > 0 ? (
              <div className={styles.householdList}>
                {attendingHouseholds.map(([householdName, guests], index) => (
                  <section className={styles.householdGroup} key={householdName}>
                    <header>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <p>Invitation Party</p>
                        <h3>{householdName}</h3>
                      </div>
                    </header>
                    <ul>
                      {guests.map((guest) => (
                        <li key={guest.name}>{guest.name}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>
                {publicList.configured
                  ? "No guests have confirmed yet. Please check back soon."
                  : "The attending guest list will appear here as responses come in."}
              </p>
            )}
          </div>
        </section>

        <section className={styles.publicGuide} aria-label="RSVP information">
          <div className={styles.publicGuideInner}>
            <header>
              <p className={styles.eyebrow}>Your Invitation</p>
              <h2>Looking for your personal invitation?</h2>
            </header>

            <div className={styles.publicGuideBody}>
              <Link2 aria-hidden="true" />
              <div>
                <p>
                  Return to the message sent to you and open your unique link to
                  reply or update your response. Please reach out to Sherwin or
                  Franzy if you need the link sent again.
                </p>
                <small>
                  Only confirmed names appear here. Notes and other responses remain private.
                </small>
                <div className={styles.linkRow}>
                  <Link href="/#home" className={styles.linkGhost}>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
