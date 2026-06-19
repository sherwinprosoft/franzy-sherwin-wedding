"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  rsvpStatuses,
  type RsvpParty,
  type RsvpStatus,
} from "@/lib/rsvp-types";
import styles from "./RsvpForm.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

type RsvpFormProps = {
  initialParty: RsvpParty;
};

type ApiResponse = {
  party?: RsvpParty;
  error?: string;
};

const statusLabels: Record<RsvpStatus, string> = {
  Coming: "Will Attend",
  "Not Coming": "Unable to Attend",
  Pending: "Will Confirm Soon",
};

function formatRsvpDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);

  return `${datePart} at ${timePart} PHT`;
}

function getInitialStatuses(party: RsvpParty) {
  return party.guests.reduce<Record<string, RsvpStatus>>((statuses, guest) => {
    statuses[guest.id] = guest.status;
    return statuses;
  }, {});
}

export default function RsvpForm({ initialParty }: RsvpFormProps) {
  const [party, setParty] = useState(initialParty);
  const [guestStatuses, setGuestStatuses] = useState(getInitialStatuses(initialParty));
  const [note, setNote] = useState(initialParty.note);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  const responseCounts = party.guests.reduce<Record<RsvpStatus, number>>(
    (counts, guest) => {
      const status = guestStatuses[guest.id] ?? guest.status;
      counts[status] += 1;
      return counts;
    },
    {
      Coming: 0,
      "Not Coming": 0,
      Pending: 0,
    },
  );

  const handleStatusChange = (guestId: string, nextStatus: RsvpStatus) => {
    setGuestStatuses((current) => ({
      ...current,
      [guestId]: nextStatus,
    }));
    setSaveState("idle");
    setMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveState("saving");
    setMessage("");

    try {
      const response = await fetch(`/api/rsvp/${encodeURIComponent(party.token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guests: party.guests.map((guest) => ({
            id: guest.id,
            status: guestStatuses[guest.id] ?? guest.status,
          })),
          note,
        }),
      });
      const data = await response.json() as ApiResponse;

      if (!response.ok || !data.party) {
        throw new Error(data.error || "Unable to save your RSVP.");
      }

      setParty(data.party);
      setGuestStatuses(getInitialStatuses(data.party));
      setNote(data.party.note);
      setSaveState("saved");
      setMessage("Thank you. Your RSVP has been saved.");
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error
        ? error.message
        : "We could not save your RSVP. Please try again.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.partyHeader}>
        <p className={styles.kicker}>Invitation for</p>
        <h2>{party.householdName}</h2>
        <p>
          Kindly let us know who will be joining us for the wedding day.
        </p>
      </div>

      <div className={styles.responseSummary}>
        <span>{responseCounts.Coming} Attending</span>
        <span>{responseCounts["Not Coming"]} Unable</span>
        <span>{responseCounts.Pending} To Confirm</span>
      </div>

      <div className={styles.guestList} aria-label="Guest responses">
        {party.guests.map((guest) => {
          const selectedStatus = guestStatuses[guest.id] ?? guest.status;

          return (
            <fieldset key={guest.id} className={styles.guestCard}>
              <legend className={styles.guestName}>{guest.name}</legend>
              <div className={styles.statusGrid}>
                {rsvpStatuses.map((option) => (
                  <label
                    key={option}
                    className={[
                      styles.statusOption,
                      selectedStatus === option ? styles.statusOptionActive : "",
                    ].filter(Boolean).join(" ")}
                  >
                    <input
                      type="radio"
                      name={`status-${guest.id}`}
                      value={option}
                      checked={selectedStatus === option}
                      onChange={() => handleStatusChange(guest.id, option)}
                    />
                    <span>{statusLabels[option]}</span>
                  </label>
                ))}
              </div>
              {guest.updatedAt ? (
                <p className={styles.guestUpdated}>
                  Last saved: {formatRsvpDate(guest.updatedAt)}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      {party.guests.length === 0 ? (
        <div className={styles.emptyState}>
          Guest names will appear here once this invitation is ready.
        </div>
      ) : null}

      <label className={styles.field}>
        <span>Note for the couple</span>
        <textarea
          value={note}
          rows={4}
          placeholder="Share any dietary notes, travel notes, or a short message for Sherwin and Franzy."
          onChange={(event) => {
            setNote(event.target.value);
            setSaveState("idle");
            setMessage("");
          }}
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" disabled={saveState === "saving"}>
          {saveState === "saving" ? "Saving RSVP..." : "Save RSVP"}
        </button>
        {message ? (
          <p className={saveState === "error" ? styles.error : styles.success}>
            {message}
          </p>
        ) : null}
        {saveState === "saved" ? (
          <Link href="/rsvp" className={styles.publicLink}>
            View Attending Guests
          </Link>
        ) : null}
      </div>

      {party.updatedAt ? (
        <p className={styles.updated}>
          Response last updated: {formatRsvpDate(party.updatedAt)}
        </p>
      ) : null}
    </form>
  );
}
