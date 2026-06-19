import {
  rsvpStatuses,
  type RsvpGuest,
  type RsvpGuestUpdateInput,
  type RsvpParty,
  type RsvpStatus,
  type RsvpUpdateInput,
} from "./rsvp-types";

export class RsvpError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "RSVP_ERROR") {
    super(message);
    this.name = "RsvpError";
    this.status = status;
    this.code = code;
  }
}

type AppsScriptResponse = {
  ok?: boolean;
  error?: string;
  party?: unknown;
  publicList?: unknown;
};

export type PublicRsvpAttendee = {
  name: string;
};

export type PublicRsvpList = {
  attendees: PublicRsvpAttendee[];
  confirmedHouseholds: number;
  configured: boolean;
  unavailable: boolean;
};

function getRsvpConfig() {
  const scriptUrl = process.env.RSVP_SCRIPT_URL;
  const scriptSecret = process.env.RSVP_SCRIPT_SECRET;

  if (!scriptUrl || !scriptSecret) {
    throw new RsvpError(
      "RSVP is not configured yet.",
      503,
      "RSVP_NOT_CONFIGURED",
    );
  }

  return { scriptUrl, scriptSecret };
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}

function normalizeStatus(value: unknown): RsvpStatus {
  const status = getString(value);
  const canonicalStatus = rsvpStatuses.find((option) => (
    option.toLowerCase() === status.toLowerCase()
  ));

  if (canonicalStatus) {
    return canonicalStatus;
  }

  const statusKey = status.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  if (
    [
      "attending",
      "coming",
      "confirmed",
      "going",
      "will attend",
      "yes",
    ].includes(statusKey)
  ) {
    return "Coming";
  }

  if (
    [
      "cannot attend",
      "declined",
      "not attending",
      "not coming",
      "no",
      "unable",
      "unable to attend",
      "will not attend",
    ].includes(statusKey)
  ) {
    return "Not Coming";
  }

  return "Pending";
}

function fallbackGuestId(name: string, index: number) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `guest-${index + 1}`
  );
}

function normalizeGuest(value: unknown, index: number): RsvpGuest | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const name = getString(record.name) || getString(record.guestName);

  if (!name) {
    return null;
  }

  return {
    id:
      getString(record.id) ||
      getString(record.guestId) ||
      fallbackGuestId(name, index),
    name,
    status: normalizeStatus(record.status),
    updatedAt: getString(record.updatedAt),
  };
}

function normalizeGuests(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((guest, index) => normalizeGuest(guest, index))
    .filter((guest): guest is RsvpGuest => Boolean(guest));
}

function getLatestUpdatedAt(guests: RsvpGuest[]) {
  return guests.reduce((latest, guest) => {
    if (!guest.updatedAt) {
      return latest;
    }

    if (!latest || guest.updatedAt > latest) {
      return guest.updatedAt;
    }

    return latest;
  }, "");
}

function normalizeParty(value: unknown, fallbackToken: string): RsvpParty {
  if (!value || typeof value !== "object") {
    throw new RsvpError("RSVP link not found.", 404, "RSVP_NOT_FOUND");
  }

  const record = value as Record<string, unknown>;
  const guests = normalizeGuests(record.guests);

  if (guests.length === 0) {
    throw new RsvpError("RSVP service returned no guests.", 502);
  }

  return {
    token: getString(record.token) || fallbackToken,
    householdName: getString(record.householdName) || "Guest Party",
    guests,
    note: getString(record.note),
    updatedAt: getString(record.updatedAt) || getLatestUpdatedAt(guests),
  };
}

function parseAppsScriptResponse(data: AppsScriptResponse, token: string) {
  if (data.ok === false || data.error) {
    const message = data.error || "Unable to load RSVP details.";
    const isNotFound = message.toLowerCase().includes("not found");

    throw new RsvpError(
      message,
      isNotFound ? 404 : 502,
      isNotFound ? "RSVP_NOT_FOUND" : "RSVP_SCRIPT_ERROR",
    );
  }

  return normalizeParty(data.party, token);
}

function normalizePublicAttendee(value: unknown): PublicRsvpAttendee | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const name = getString(record.name) || getString(record.guestName);

  if (!name) {
    return null;
  }

  return { name };
}

function normalizePublicAttendees(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((guest) => normalizePublicAttendee(guest))
    .filter((guest): guest is PublicRsvpAttendee => Boolean(guest))
    .sort((first, second) => first.name.localeCompare(second.name));
}

function normalizePublicList(value: unknown): PublicRsvpList {
  if (!value || typeof value !== "object") {
    throw new RsvpError("RSVP public list is unavailable.", 502);
  }

  const record = value as Record<string, unknown>;
  const attendees = normalizePublicAttendees(record.attendees);

  return {
    attendees,
    confirmedHouseholds: getNumber(record.confirmedHouseholds),
    configured: true,
    unavailable: false,
  };
}

async function readAppsScriptPublicListJson(response: Response) {
  let data: AppsScriptResponse;

  try {
    data = await response.json() as AppsScriptResponse;
  } catch {
    throw new RsvpError("RSVP service returned an invalid response.", 502);
  }

  if (!response.ok || data.ok === false || data.error) {
    throw new RsvpError(
      data.error || "RSVP public list is unavailable.",
      response.status || 502,
      "RSVP_SCRIPT_ERROR",
    );
  }

  return normalizePublicList(data.publicList);
}

async function readAppsScriptJson(response: Response, token: string) {
  let data: AppsScriptResponse;

  try {
    data = await response.json() as AppsScriptResponse;
  } catch {
    throw new RsvpError("RSVP service returned an invalid response.", 502);
  }

  if (!response.ok) {
    throw new RsvpError(
      data.error || "RSVP service is unavailable.",
      response.status,
      "RSVP_SCRIPT_ERROR",
    );
  }

  return parseAppsScriptResponse(data, token);
}

export async function getRsvpParty(token: string) {
  const cleanToken = token.trim();

  if (!cleanToken) {
    throw new RsvpError("Missing RSVP token.", 400, "RSVP_MISSING_TOKEN");
  }

  const { scriptUrl, scriptSecret } = getRsvpConfig();
  const url = new URL(scriptUrl);
  url.searchParams.set("secret", scriptSecret);
  url.searchParams.set("token", cleanToken);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  return readAppsScriptJson(response, cleanToken);
}

function getPublicTokens() {
  return (process.env.RSVP_PUBLIC_TOKENS || "")
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

async function getPublicRsvpListFromScript() {
  const { scriptUrl, scriptSecret } = getRsvpConfig();
  const url = new URL(scriptUrl);
  url.searchParams.set("secret", scriptSecret);
  url.searchParams.set("action", "publicList");

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  return readAppsScriptPublicListJson(response);
}

async function getPublicRsvpListFromTokens(tokens: string[]) {
  const results = await Promise.allSettled(
    tokens.map((token) => getRsvpParty(token)),
  );
  const parties = results
    .filter((result): result is PromiseFulfilledResult<RsvpParty> => (
      result.status === "fulfilled"
    ))
    .map((result) => result.value);
  const attendees = parties
    .flatMap((party) => (
      party.guests
        .filter((guest) => guest.status === "Coming")
        .map((guest) => ({ name: guest.name }))
    ))
    .sort((first, second) => first.name.localeCompare(second.name));
  const confirmedHouseholds = parties.filter((party) => (
    party.guests.some((guest) => guest.status === "Coming")
  )).length;

  return {
    attendees,
    confirmedHouseholds,
    configured: true,
    unavailable: results.some((result) => result.status === "rejected"),
  };
}

export async function getPublicRsvpList(): Promise<PublicRsvpList> {
  const tokens = Array.from(new Set(getPublicTokens()));

  try {
    return await getPublicRsvpListFromScript();
  } catch (error) {
    if (tokens.length > 0) {
      const fallbackList = await getPublicRsvpListFromTokens(tokens);

      return {
        ...fallbackList,
        unavailable: fallbackList.unavailable,
      };
    }

    if (error instanceof RsvpError && error.code === "RSVP_NOT_CONFIGURED") {
      return {
        attendees: [],
        confirmedHouseholds: 0,
        configured: false,
        unavailable: false,
      };
    }

    return {
      attendees: [],
      confirmedHouseholds: 0,
      configured: true,
      unavailable: true,
    };
  }
}

export function normalizeRsvpUpdate(input: unknown): RsvpUpdateInput {
  if (!input || typeof input !== "object") {
    throw new RsvpError("Invalid RSVP update.", 400, "RSVP_INVALID_UPDATE");
  }

  const record = input as Record<string, unknown>;
  const rawGuests = Array.isArray(record.guests) ? record.guests : [];
  const guests = rawGuests.reduce<RsvpGuestUpdateInput[]>((updates, guest) => {
    if (!guest || typeof guest !== "object") {
      return updates;
    }

    const guestRecord = guest as Record<string, unknown>;
    const id = getString(guestRecord.id);

    if (!id) {
      return updates;
    }

    updates.push({
      id,
      status: normalizeStatus(guestRecord.status),
    });

    return updates;
  }, []);

  if (guests.length === 0) {
    throw new RsvpError(
      "Choose an RSVP status for at least one guest.",
      400,
      "RSVP_INVALID_UPDATE",
    );
  }

  return {
    guests,
    note: getString(record.note),
  };
}

export async function updateRsvpParty(token: string, input: unknown) {
  const cleanToken = token.trim();

  if (!cleanToken) {
    throw new RsvpError("Missing RSVP token.", 400, "RSVP_MISSING_TOKEN");
  }

  const update = normalizeRsvpUpdate(input);
  const { scriptUrl, scriptSecret } = getRsvpConfig();

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      secret: scriptSecret,
      token: cleanToken,
      ...update,
    }),
  });

  return readAppsScriptJson(response, cleanToken);
}

export function getRsvpErrorResponse(error: unknown) {
  if (error instanceof RsvpError) {
    return {
      body: { error: error.message, code: error.code },
      status: error.status,
    };
  }

  return {
    body: { error: "Unexpected RSVP error.", code: "RSVP_ERROR" },
    status: 500,
  };
}
