import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Navigation } from "lucide-react";
import RsvpForm from "@/components/RsvpForm";
import RsvpInvitationGate from "@/components/RsvpInvitationGate";
import { wedding } from "@/data/wedding";
import type { RsvpParty } from "@/lib/rsvp-types";
import {
  getRsvpErrorResponse,
  getRsvpParty,
} from "@/lib/rsvp";
import {
  getGuestCallTimeAssignments,
  groupGuestCallTimes,
} from "@/lib/wedding-schedule";
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
    const callTimeAssignments = getGuestCallTimeAssignments(party.guests);
    const callTimeGroups = groupGuestCallTimes(callTimeAssignments);

    return (
      <RsvpInvitationGate
        brideName="Franzy"
        callTimeGroups={callTimeGroups}
        ceremonyLocation="Baguio City"
        ceremonyName={ceremony.name}
        ceremonyTime={ceremony.time}
        coupleName={wedding.couple.display}
        dateLabel={wedding.date.full}
        groomName="Sherwin"
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
                  <span>Your Invitation</span>
                  <h1>Wedding Day Details</h1>
                  <p>Everything you need for our celebration in Baguio City.</p>
                </div>
                <div className={styles.eventFacts}>
                  <div>
                    <CalendarDays aria-hidden="true" />
                    <span>Date</span>
                    <strong>{wedding.date.full}</strong>
                  </div>
                  <div>
                    <Clock3 aria-hidden="true" />
                    <span>Your call time</span>
                    <strong>{callTimeGroups.length === 1 ? callTimeGroups[0].time : "See schedule"}</strong>
                  </div>
                  <div>
                    <MapPin aria-hidden="true" />
                    <span>Location</span>
                    <strong>Baguio City</strong>
                  </div>
                </div>
                <section className={styles.personalSchedule} aria-labelledby="personal-schedule-title">
                  <div className={styles.personalScheduleHeader}>
                    <span>For your household</span>
                    <h2 id="personal-schedule-title">Personal Call Times</h2>
                  </div>
                  <ul>
                    {callTimeGroups.map((group) => (
                      <li key={group.key}>
                        <strong>{group.time}</strong>
                        <div>
                          <span>{group.title}</span>
                          <p>{group.guestNames.join(" · ")}</p>
                          <small>{group.description}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
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
                    <p className={styles.eventNote}>{ceremony.address}</p>
                  </li>
                  <li className={styles.eventStep}>
                    <span className={styles.eventTime}>After Ceremony</span>
                    <strong className={styles.eventTitle}>Reception &amp; Dinner</strong>
                    <p className={styles.eventPlace}>{reception.name}</p>
                    <p className={styles.eventNote}>{reception.address}</p>
                  </li>
                </ol>
              </section>

              <div className={styles.utilityLinks} aria-label="Wedding links">
                <Link href={ceremony.mapUrl} target="_blank" rel="noreferrer" className={styles.linkGhost}>
                  <Navigation aria-hidden="true" />
                  Church Directions
                </Link>
                <Link href={reception.mapUrl} target="_blank" rel="noreferrer" className={styles.linkGhost}>
                  <Navigation aria-hidden="true" />
                  Reception Directions
                </Link>
                <Link href="/#details" className={styles.linkGhost}>
                  Wedding Website
                </Link>
              </div>

              <RsvpForm
                callTimeAssignments={callTimeAssignments}
                initialParty={party}
              />
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
