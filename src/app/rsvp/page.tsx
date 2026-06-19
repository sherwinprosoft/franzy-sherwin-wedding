import Link from "next/link";
import { wedding } from "@/data/wedding";
import { getPublicRsvpList } from "@/lib/rsvp";
import styles from "./RsvpPage.module.css";

export const metadata = {
  title: `RSVP | ${wedding.couple.display}`,
  description: `RSVP information for ${wedding.couple.display}.`,
};

export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const publicList = await getPublicRsvpList();
  const confirmedCount = publicList.attendees.length;

  return (
    <section className={styles.section}>
      <div className={styles.floralWash} aria-hidden="true" />
      <div className={styles.inner}>
        <header className={styles.heroPanel}>
          <p className={styles.eyebrow}>RSVP</p>
          <h1 className={styles.title}>Guests Joining Us</h1>
          <p className={styles.coupleName}>{wedding.couple.display}</p>
          <div className={styles.dateRule}>
            <span>{wedding.date.full}</span>
          </div>
          <p className={styles.intro}>
            Please use the personal RSVP link sent with your invitation. Each
            link is unique to your household.
          </p>
        </header>

        <div className={styles.rsvpGrid}>
          <section className={styles.attendeePanel} aria-labelledby="attendee-list-title">
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Attending Guests</p>
              <h2 id="attendee-list-title">Guests Joining Us</h2>
              <p>
                This list shows guests who have confirmed that they will attend.
              </p>
            </div>

            <div className={styles.statsRow} aria-label="RSVP response summary">
              <div>
                <strong>{confirmedCount}</strong>
                <span>Guests attending</span>
              </div>
              <div>
                <strong>{publicList.confirmedHouseholds}</strong>
                <span>Households replied</span>
              </div>
            </div>

            {publicList.unavailable ? (
              <p className={styles.noticeText}>
                The attending guest list is temporarily unavailable or incomplete.
                Please check again later.
              </p>
            ) : null}

            {confirmedCount > 0 ? (
              <ul className={styles.attendeeList}>
                {publicList.attendees.map((guest, index) => (
                  <li key={`${guest.name}-${index}`}>{guest.name}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>
                {publicList.configured
                  ? "No guests have confirmed yet. Please check back soon."
                  : "The attending guest list will appear here as responses come in."}
              </p>
            )}
          </section>

          <aside className={styles.infoPanel} aria-label="RSVP instructions">
            <div className={styles.infoBlock}>
              <p className={styles.statusLabel}>How to RSVP</p>
              <p className={styles.statusText}>
                Open your personal link, choose a response for each invited
                guest, and save your reply.
              </p>
            </div>

            <div className={styles.infoBlock}>
              <p className={styles.statusLabel}>Privacy Note</p>
              <p className={styles.statusText}>
                Only guests marked as attending are shown here. Notes and other
                responses remain private to Sherwin and Franzy.
              </p>
            </div>

            <p className={styles.bodyText}>
              Each link is unique and will open only the guests included in your
              invitation. If you misplaced your link or need to update your
              response, please reach out to Sherwin or Franzy.
            </p>

            <div className={styles.linkRow}>
              <Link href="/#home" className={styles.linkGhost}>
                Back to Home
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
