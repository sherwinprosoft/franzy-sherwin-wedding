import { wedding } from "@/data/wedding";

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function foldLine(value: string) {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let line = "";
  let bytes = 0;

  for (const character of value) {
    const length = encoder.encode(character).length;

    if (bytes + length > 75) {
      lines.push(line);
      line = " ";
      bytes = 1;
    }

    line += character;
    bytes += length;
  }

  lines.push(line);
  return lines.join("\r\n");
}

export function GET() {
  const { couple, date, guestArrival, venues } = wedding;
  const description = [
    `${date.full} — all times are Philippine time.`,
    `Guest arrival: ${guestArrival.time}.`,
    `Ceremony: ${date.ceremonyTime} at ${venues.ceremony.name}.`,
    `Ceremony address: ${venues.ceremony.address}.`,
    `Ceremony map: ${venues.ceremony.mapUrl}`,
    "",
    `Reception: ${venues.reception.name}, ${venues.reception.address}.`,
    "Reception follows immediately after the ceremony.",
    `Reception map: ${venues.reception.mapUrl}`,
    "",
    "Entourage members with an earlier call time should follow their personal invitation.",
  ].join("\n");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sherwin and Franzy//Wedding Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:urn:uuid:857ae541-7f18-409c-873c-fb703e24aa98",
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(new Date(guestArrival.startsAt))}`,
    `SUMMARY:${escapeText(`${couple.display} Wedding`)}`,
    `LOCATION:${escapeText(`${venues.ceremony.name}, ${venues.ceremony.address}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(foldLine).join("\r\n") + "\r\n";

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sherwin-franzy-wedding.ics"',
    },
  });
}
