import Link from "next/link";
import RsvpForm from "@/components/RsvpForm";
import RsvpInvitationGate from "@/components/RsvpInvitationGate";
import { wedding } from "@/data/wedding";
import type { RsvpParty } from "@/lib/rsvp-types";
import {
  getRsvpErrorResponse,
  getRsvpParty,
} from "@/lib/rsvp";
import styles from "../RsvpPage.module.css";

type RsvpTokenPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const metadata = {
  title: `RSVP | ${wedding.couple.display}`,
  description: `RSVP for ${wedding.couple.display}.`,
};

export default async function RsvpTokenPage({ params }: RsvpTokenPageProps) {
  const { token } = await params;
  const ceremony = wedding.venues.ceremony;
  const guestArrival = wedding.guestArrival;
  const reception = wedding.venues.reception;
  let party: RsvpParty | null = null;
  let errorResponse: ReturnType<typeof getRsvpErrorResponse> | null = null;

  try {
    party = await getRsvpParty(token);
  } catch (error) {
    errorResponse = getRsvpErrorResponse(error);
  }

  if (party) {
    return (
      <RsvpInvitationGate
        ceremonyLocation="Baguio City"
        ceremonyName={ceremony.name}
        ceremonyTime={ceremony.time}
        coupleName={wedding.couple.display}
        dateLabel={wedding.date.full}
        guestArrivalTime={guestArrival.time}
        householdName={party.householdName}
      >
        <section className={styles.section}>
          <div className={styles.floralWash} aria-hidden="true" />
          <div className={styles.inner}>
            <div className={styles.formPanel}>
              <section
                className={styles.eventSummary}
                aria-label="Wedding event summary"
                data-rsvp-focus
                tabIndex={-1}
              >
                <div className={styles.eventSummaryIntro}>
                  <span>Wedding Details</span>
                  <p>Review the ceremony and reception details before confirming your response.</p>
                </div>
                <div className={styles.eventDateStrip}>
                  <span>Date</span>
                  <strong>{wedding.date.full}</strong>
                </div>
                <ol className={styles.eventTimeline} aria-label="Wedding day timeline">
                  <li className={`${styles.eventStep} ${styles.arrivalStep}`}>
                    <span className={styles.eventTime}>{guestArrival.time}</span>
                    <strong className={styles.eventTitle}>{guestArrival.title}</strong>
                    <p className={styles.eventPlace}>{ceremony.name}</p>
                    <p className={styles.eventNote}>{guestArrival.description}</p>
                  </li>
                  <li className={styles.eventStep}>
                    <span className={styles.eventTime}>{ceremony.time}</span>
                    <strong className={styles.eventTitle}>Ceremony</strong>
                    <p className={styles.eventPlace}>{ceremony.name}</p>
                    <p className={styles.eventNote}>Wedding ceremony begins.</p>
                  </li>
                  <li className={styles.eventStep}>
                    <span className={styles.eventTime}>After Ceremony</span>
                    <strong className={styles.eventTitle}>Reception</strong>
                    <p className={styles.eventPlace}>{reception.name}</p>
                    <p className={styles.eventNote}>{reception.time}</p>
                  </li>
                </ol>
              </section>

              <div className={styles.utilityLinks} aria-label="Wedding links">
                <Link href={ceremony.mapUrl} target="_blank" rel="noreferrer" className={styles.linkGhost}>
                  Church Map
                </Link>
                <Link href={reception.mapUrl} target="_blank" rel="noreferrer" className={styles.linkGhost}>
                  Reception Map
                </Link>
                <Link href="/#details" className={styles.linkGhost}>
                  Wedding Details
                </Link>
              </div>

              <RsvpForm initialParty={party} />
            </div>
          </div>
        </section>
      </RsvpInvitationGate>
    );
  }

  const response = errorResponse ?? getRsvpErrorResponse(null);
  const isMissingConfig = response.body.code === "RSVP_NOT_CONFIGURED";
  const errorTitle = isMissingConfig
    ? "RSVP Temporarily Unavailable"
    : "RSVP Link Not Found";
  const errorMessage = isMissingConfig
    ? "We could not load RSVP responses right now."
    : response.body.error;

  return (
    <section className={styles.section}>
      <div className={styles.floralWash} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.formPanel}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>Wedding RSVP</p>
            <h1 className={styles.title}>{errorTitle}</h1>
            <p className={styles.intro}>{errorMessage}</p>
          </div>

          <p className={styles.bodyText}>
            {isMissingConfig
              ? "Please try again later, or reach out to Sherwin or Franzy for help."
              : "Please check the link you received, or reach out to Sherwin or Franzy for help."}
          </p>

          <div className={styles.linkRow}>
            <Link href="/rsvp" className={styles.linkButton}>
              RSVP Information
            </Link>
            <Link href="/#home" className={styles.linkGhost}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
