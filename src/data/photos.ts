export type PhotoLayout = "landscape" | "portrait";

export type PhotoAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  layout: PhotoLayout;
  objectPosition?: string;
};

export const heroPhotos = {
  desktop: {
    src: "/images/prewedding/tcs00359-hero.webp",
    alt: "Sherwin and Franzy seated together among misty Baguio pine trees.",
    width: 2400,
    height: 1600,
    layout: "landscape",
    objectPosition: "50% 50%",
  },
  mobile: {
    src: "/images/prewedding/tcs00359-hero.webp",
    alt: "Sherwin and Franzy seated together among misty Baguio pine trees.",
    width: 2400,
    height: 1600,
    layout: "landscape",
    objectPosition: "50% 0%",
  },
} satisfies Record<"desktop" | "mobile", PhotoAsset>;

export const galleryPhotos: PhotoAsset[] = [
  {
    src: "/images/prewedding/tcs00321.webp",
    alt: "Sherwin and Franzy sharing a quiet moment in a misty pine forest.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00266.webp",
    alt: "Sherwin and Franzy smiling together during their foggy Baguio photo session.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00339.webp",
    alt: "Franzy and Sherwin framed by pine trunks and soft mountain fog.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00480.webp",
    alt: "Franzy smiling beside Sherwin as they walk beneath a clear umbrella.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00405.webp",
    alt: "Franzy and Sherwin in denim beneath the rainy Baguio pines.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00454.webp",
    alt: "Sherwin and Franzy standing beneath the timber entry of a mountain cottage.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00372.webp",
    alt: "Sherwin and Franzy standing together beneath a large tree in the mist.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00274.webp",
    alt: "Sherwin and Franzy looking toward each other in the soft mountain light.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00415.webp",
    alt: "Franzy and Sherwin walking through the rain in matching denim jackets.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00396.webp",
    alt: "Sherwin and Franzy surrounded by deep green trees and morning fog.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00457.webp",
    alt: "Franzy and Sherwin posing together near a rustic Baguio cottage.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00548.webp",
    alt: "Sherwin and Franzy sharing an affectionate moment beneath the trees.",
    width: 1800,
    height: 1188,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00054.webp",
    alt: "Sherwin and Franzy walking hand in hand along a winding foggy road.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00269.webp",
    alt: "Sherwin and Franzy close together against the muted Baguio landscape.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00303.webp",
    alt: "Sherwin and Franzy smiling together with the foggy forest behind them.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00312.webp",
    alt: "Franzy and Sherwin sharing a candid laugh during their pre-wedding session.",
    width: 1800,
    height: 1200,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00324.webp",
    alt: "Sherwin and Franzy standing among tall pines in their light-colored outfits.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00345.webp",
    alt: "Franzy and Sherwin holding hands in a quiet pine forest clearing.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00369.webp",
    alt: "Sherwin and Franzy walking across a green lawn beneath the fog.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00387.webp",
    alt: "Sherwin and Franzy together beneath a broad tree in the Baguio greenery.",
    width: 1800,
    height: 1440,
    layout: "landscape",
  },
  {
    src: "/images/prewedding/tcs00427.webp",
    alt: "Franzy and Sherwin sharing an umbrella during a rainy forest walk.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
  {
    src: "/images/prewedding/tcs00593.webp",
    alt: "Sherwin and Franzy standing close beneath the rain-damp pine trees.",
    width: 1200,
    height: 1800,
    layout: "portrait",
  },
];
