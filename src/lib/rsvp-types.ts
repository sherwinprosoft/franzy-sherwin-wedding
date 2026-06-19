export const rsvpStatuses = ["Coming", "Not Coming", "Pending"] as const;

export type RsvpStatus = (typeof rsvpStatuses)[number];

export type RsvpGuest = {
  id: string;
  name: string;
  status: RsvpStatus;
  updatedAt: string;
};

export type RsvpParty = {
  token: string;
  householdName: string;
  guests: RsvpGuest[];
  note: string;
  updatedAt: string;
};

export type RsvpGuestUpdateInput = {
  id: string;
  status: RsvpStatus;
};

export type RsvpUpdateInput = {
  guests: RsvpGuestUpdateInput[];
  note?: string;
};
