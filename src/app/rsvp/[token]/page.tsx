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
        coupleName={wedding.couple.display}
        dateLabel={wedding.date.full}
        householdName={party.householdName}
      >
        <section className={styles.section}>
          <div className={styles.floralWash} aria-hidden="true" />
          <div className={styles.inner}>
            <div className={styles.formPanel}>
              <div className={styles.header}>
                <p className={styles.eyebrow}>Personal RSVP</p>
                <h1 className={styles.title}>You Are Invited</h1>
                <p className={styles.coupleName}>{wedding.couple.display}</p>
                <div className={styles.dateRule}>
                  <span>{wedding.date.full}</span>
                </div>
                <p className={styles.intro}>
                  Please confirm the response for each guest in your invitation.
                </p>
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
