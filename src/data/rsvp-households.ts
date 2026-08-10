const householdEntries = [
  ["Genesis Corinth Abella", "Abella Family"],
  ["Aijems Kristian Abella", "Abella Family"],
  ["Rommel Berganio", "Prosoft Family"],
  ["Ruth Leah Hernan", "Prosoft Family"],
  ["Paulino Caparas", "Paulino Caparas Family"],
  ["Marina Caparas", "Paulino Caparas Family"],
  ["Patricia May Caparas", "Paulino Caparas Family"],
  ["Mara Caparas", "Paulino Caparas Family"],
  ["Francisco Caparas", "Francisco Caparas Family"],
  ["Zenaida Caparas", "Francisco Caparas Family"],
  ["Coda Zorrel Ora", "Ora Family"],
  ["Franzy Joyce Caparas", "Sherwin & Franzy"],
  ["Sherwin Ross Ora", "Sherwin & Franzy"],
  ["Khabib Manuel Gavina", "Gavina Family"],
  ["Zeus Crispin Gavina", "Gavina Family"],
  ["Maria Guinevere Arenas", "Gavina Family"],
  ["Marius Gavina", "Gavina Family"],
  ["Regina Bo", "Bo Family"],
  ["Ruby Ann Leynes", "Leynes-Puchacan Family"],
  ["Jianna L. Puchacan", "Leynes-Puchacan Family"],
  ["John Anthony Caparas", "Anthony & Deanne"],
  ["Deanne Dimagiba", "Anthony & Deanne"],
  ["Nover Lopez", "Lopez Family"],
  ["Paula Marie Lopez", "Lopez Family"],
  ["Mark John Caparas", "Mark & Jella"],
  ["Jella Marie Guevarra", "Mark & Jella"],
  ["Mr. Eduardo Ora", "Ora Family"],
  ["Mrs. Rosario Ora", "Ora Family"],
  ["Michael Braxton Ora", "Ora Family"],
  ["Glenn Edward Ora", "Ora Family"],
  ["Czarina Maye Ora", "Ora Family"],
  ["Samantha Sadural Ora", "Ora Family"],
  ["Mr. Miguel Padilla", "Padilla Family"],
  ["Mrs. Remedios Padilla", "Padilla Family"],
  ["Joseph Padilla", "Padilla Family"],
  ["Michelle Padilla", "Padilla Family"],
  ["Michelle Padilla + 1", "Padilla Family"],
  ["Michael Padilla", "Padilla Family"],
  ["Paolo Reyes", "Paolo & Arielle"],
  ["Arielle Anne Madriaga", "Paolo & Arielle"],
  ["Angela Luisa Antonio", "Angela"],
  ["Samuel Lasaten", "Lasaten Family"],
  ["Maic Lasaten", "Lasaten Family"],
  ["Steffany Tango", "Tango Family"],
  ["Clyde Tango", "Tango Family"],
  ["Tiffany Cly Tango", "Tango Family"],
  ["Zoe Cleone Tango", "Tango Family"],
  ["Video 1", "Photo & Video Team"],
  ["Video 2", "Photo & Video Team"],
  ["Video 3", "Photo & Video Team"],
  ["Gloria Ponce", "Ponce Family"],
  ["Max Ponce", "Ponce Family"],
] as const;

function normalizeName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const householdsByGuestName = new Map(
  householdEntries.map(([guestName, householdName]) => [
    normalizeName(guestName),
    householdName,
  ]),
);

export function getKnownRsvpHousehold(guestName: string) {
  return householdsByGuestName.get(normalizeName(guestName));
}
