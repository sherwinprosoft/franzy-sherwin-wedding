import { wedding } from "@/data/wedding";
import type { RsvpGuest } from "./rsvp-types";

export type WeddingCallTimeKey = "preparation" | "groomsmen" | "general";

export type WeddingCallTime = {
  key: WeddingCallTimeKey;
  time: string;
  title: string;
  description: string;
};

export type GuestCallTimeAssignment = WeddingCallTime & {
  guestId: string;
  guestName: string;
};

export type PartyCallTimeGroup = WeddingCallTime & {
  guestNames: string[];
};

function normalizeGuestName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const preparationNames = new Set([
  ...wedding.entourage.mainParty
    .filter(({ role }) => ["Maid of Honor", "Matron of Honor"].includes(role))
    .flatMap(({ names }) => names),
  ...wedding.entourage.bridesmaids,
  "Steffany Tango",
].map(normalizeGuestName));

const groomsmenNames = new Set(
  [
    ...wedding.entourage.mainParty
      .filter(({ role }) => role === "Best Man")
      .flatMap(({ names }) => names),
    ...wedding.entourage.groomsmen,
  ].map(normalizeGuestName),
);

const callTimes: Record<WeddingCallTimeKey, WeddingCallTime> = {
  preparation: {
    key: "preparation",
    time: wedding.preparationShoot.time,
    title: wedding.preparationShoot.title,
    description:
      "Please arrive by 8:00 AM. The final preparation location and instructions will follow.",
  },
  groomsmen: {
    key: "groomsmen",
    time: wedding.groomsmenArrival.time,
    title: wedding.groomsmenArrival.title,
    description: wedding.groomsmenArrival.description,
  },
  general: {
    key: "general",
    time: wedding.guestArrival.time,
    title: wedding.guestArrival.title,
    description: wedding.guestArrival.description,
  },
};

export function getGuestCallTime(guestName: string): WeddingCallTime {
  const normalizedName = normalizeGuestName(guestName);

  if (preparationNames.has(normalizedName)) {
    return callTimes.preparation;
  }

  if (groomsmenNames.has(normalizedName)) {
    return callTimes.groomsmen;
  }

  return callTimes.general;
}

export function getGuestCallTimeAssignments(guests: RsvpGuest[]) {
  return guests.map<GuestCallTimeAssignment>((guest) => ({
    ...getGuestCallTime(guest.name),
    guestId: guest.id,
    guestName: guest.name,
  }));
}

export function groupGuestCallTimes(assignments: GuestCallTimeAssignment[]) {
  const groupedCallTimes = new Map<WeddingCallTimeKey, PartyCallTimeGroup>();

  assignments.forEach((assignment) => {
    const existingGroup = groupedCallTimes.get(assignment.key);

    if (existingGroup) {
      existingGroup.guestNames.push(assignment.guestName);
      return;
    }

    groupedCallTimes.set(assignment.key, {
      key: assignment.key,
      time: assignment.time,
      title: assignment.title,
      description: assignment.description,
      guestNames: [assignment.guestName],
    });
  });

  return (["preparation", "groomsmen", "general"] as const)
    .map((key) => groupedCallTimes.get(key))
    .filter((group): group is PartyCallTimeGroup => Boolean(group));
}
