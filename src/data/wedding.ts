import { weddingTheme } from "./theme";

const colors = weddingTheme.colors;

export const wedding = {
  couple: {
    groom: "Sherwin Ross Ora",
    bride: "Franzy Joyce Caparas",
    display: "Sherwin & Franzy",
    monogram: "S & F",
  },
  date: {
    month: "DEC",
    monthName: "December",
    day: "5",
    year: "2026",
    weekday: "Saturday",
    time: "2 PM",
    ceremonyTime: "2:00 PM",
    full: "Saturday, December 5, 2026",
    countdownTarget: "2026-12-05T14:00:00+08:00",
  },
  venues: {
    ceremony: {
      label: "The Ceremony",
      name: "St. John Don Bosco Parish",
      address: "Don Bosco St. corner Malvar St., Trancoville, Baguio City, Benguet",
      time: "2:00 PM",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=St.+John+Don+Bosco+Parish+Trancoville+Baguio",
    },
    reception: {
      label: "The Reception",
      name: "Craft 1945",
      address: "9 Outlook Drive, Baguio City",
      time: "To follow immediately after",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Craft+1945+9+Outlook+Drive+Baguio",
    },
  },
  preparationShoot: {
    title: "Entourage Preparation Shoot",
    time: "8:00 AM",
    status: "Details to follow",
    audience: "Maid of Honor, Best Man, Bridesmaids, and Groomsmen",
    description:
      "Our photo and video team will begin capturing preparation moments before the church wedding. Final location and detailed instructions will follow.",
    duration: "Please allow 4-6 hours for preparation coverage before the ceremony.",
  },
  navItems: [
    { label: "Home", href: "/#home" },
    { label: "Wedding Day", href: "/#details" },
    { label: "Guest Guide", href: "/#notes" },
    { label: "Entourage", href: "/#entourage" },
    { label: "RSVP", href: "/rsvp" },
  ],
  motif: weddingTheme.motif,
  guestAttire: weddingTheme.guestAttire,
  attireGuide: {
    intro:
      "Please find your role below and follow the assigned color guide. Guests are invited to wear soft cream formal attire.",
    guest: {
      eyebrow: "For Guests",
      title: "Soft Cream Formal Attire",
      description:
        "Guests are encouraged to wear soft cream formal attire. Please keep the look dressy and understated so the entourage colors remain distinct.",
      swatches: [
        colors.softCream,
      ],
    },
    entourage: {
      eyebrow: "For the Entourage",
      title: "Entourage Attire Assignments",
      description:
        "Find your role and follow the assigned color.",
      columns: [
        {
          title: "Dress & Gown Guide",
          description: "Dress and gown assignments for Principal Sponsors, Maid of Honor, and Bridesmaids.",
          callout: "",
          roles: [
            {
              role: "Principal Sponsors",
              attire: "Warm Taupe Gown",
              previews: [
                {
                  src: "/images/attire-principal-sponsor-warm-taupe-gown-ai.png",
                  alt: "Warm taupe formal gown reference.",
                  position: "50% 50%",
                },
              ],
              swatches: [
                colors.warmTaupe,
              ],
            },
            {
              role: "Maid of Honor",
              attire: "Rich Brown Gown",
              previews: [
                {
                  src: "/images/attire-bridesmaid-secondary-rich-brown-gown-ai.png",
                  alt: "Rich brown formal gown reference.",
                  position: "50% 50%",
                },
              ],
              swatches: [
                colors.richBrown,
              ],
            },
            {
              role: "Bridesmaids",
              attire: "Dark Brown Gown",
              previews: [
                {
                  src: "/images/attire-maid-bridesmaid-dark-brown-gown-ai.png",
                  alt: "Dark brown formal gown reference.",
                  position: "50% 50%",
                },
              ],
              swatches: [
                colors.darkBrown,
              ],
            },
          ],
        },
        {
          title: "Barong Tagalog Guide",
          description: "Barong Tagalog assignments for Principal Sponsors, Best Man, and Groomsmen.",
          callout: "",
          roles: [
            {
              role: "Principal Sponsors",
              attire: "Barong Tagalog + Black Trousers",
              previews: [
                {
                  src: "/images/attire-principal-sponsor-barong-black-trousers-v2-ai.png",
                  alt: "Barong Tagalog with black trousers reference.",
                  position: "50% 50%",
                },
              ],
              swatches: [
                colors.blackTrousers,
              ],
            },
            {
              role: "Best Man",
              attire: "Barong Tagalog + Rich Brown Trousers",
              previews: [
                {
                  src: "/images/attire-secondary-groomsman-barong-rich-brown-trousers-ai.png",
                  alt: "Barong Tagalog with rich brown trousers reference.",
                  position: "50% 50%",
                },
              ],
              swatches: [
                colors.richBrownTrousers,
              ],
            },
            {
              role: "Groomsmen",
              attire: "Barong Tagalog + Dark Brown Trousers",
              previews: [
                {
                  src: "/images/attire-bestman-barong-dark-brown-trousers-ai.png",
                  alt: "Barong Tagalog with dark brown trousers reference.",
                  position: "50% 50%",
                },
              ],
              swatches: [
                colors.darkBrownTrousers,
              ],
            },
          ],
        },
      ],
    },
  },
  story: {
    eyebrow: "Coming Soon",
    title: "Our Story",
    intro: "Our story will be shared here soon.",
    placeholderTitle: "Coming Soon",
    placeholder:
      "We are preparing this section and will update it soon.",
  },
  giftNote: {
    title: "A Note on Gifts",
    headline: "The presence of our friends and family is the greatest gift of all.",
    description:
      "Should you wish to bless us further, a monetary gift toward our future together would be sincerely appreciated.",
  },
  entourage: {
    parents: {
      title: "Parents of the Bride and Groom",
      members: [
        "Mr. Francisco Caparas",
        "Mrs. Zenaida Caparas",
        "Mr. Eduardo Ora",
        "Mrs. Rosario Ora",
      ],
    },
    principalSponsors: {
      title: "Principal Sponsors",
      showMembers: false,
      hiddenMessage: "Principal Sponsor names will be shared soon.",
      members: [
        "Mr. Rommel Berganio",
        "Mrs. Ruth Leah Hernan",
        "Mr. Paulino Caparas",
        "Mrs. Marina Caparas",
        "Mr. Miguel Padilla",
        "Mrs. Remedios Padilla",
      ],
    },
    mainParty: [
      { role: "Best Man", names: ["Michael Braxton Ora"] },
      { role: "Maid of Honor", names: ["Patricia May Caparas"] },
    ],
    groomsmen: [
      "Glenn Edward Ora",
      "Mark John Caparas",
      "Nover Lopez",
      "Paolo Reyes",
      "Aijems Kristian Abella",
      "John Anthony Caparas",
      "Samuel Lasaten",
    ],
    bridesmaids: [
      "Czarina Maye Ora",
      "Jella Marie Guevarra",
      "Paula Marie Lopez",
      "Arielle Anne Madriaga",
      "Steffany Bernal",
      "Maria Guinevere Arenas",
      "Angela Luisa Antonio",
    ],
    secondarySponsors: [
      { role: "Candle Sponsors", names: ["Nover Lopez", "Paula Marie Lopez"] },
      { role: "Veil Sponsors", names: ["Mark John Caparas", "Jella Marie Guevarra"] },
      { role: "Cord Sponsors", names: ["Glenn Edward Ora", "Czarina Maye Ora"] },
    ],
    bearers: [
      { role: "Ring Bearer", names: ["Coda Zorrel Ora"] },
      { role: "Coin Bearer", names: ["Khabib Manuel Gavina"] },
      { role: "Bible Bearer", names: ["Zeus Crispin Gavina"] },
    ],
    flowerGirls: ["Tiffany Cly Tango", "Zoe Cleone Tango", "Jianna L. Puchacan"],
  },
} as const;
