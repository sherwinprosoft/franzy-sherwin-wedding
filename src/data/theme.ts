// Update this file with guest-facing palette changes; regenerate attire reference images separately.
export const attireColors = {
  softCream: { name: "Soft Cream", hex: "#FEF4E8", borderHex: "#CBA98D" },
  warmTaupe: { name: "Warm Taupe", hex: "#CBA98D", borderHex: "#6B4226" },
  richBrown: { name: "Rich Brown", hex: "#6B4226", borderHex: "#3F2911" },
  darkBrown: { name: "Dark Brown", hex: "#3F2911", borderHex: "#6B4226" },
  blackTrousers: { name: "Black Trousers", hex: "#111111", borderHex: "#3F2911" },
  richBrownTrousers: { name: "Rich Brown Trousers", hex: "#6B4226", borderHex: "#3F2911" },
  darkBrownTrousers: { name: "Dark Brown Trousers", hex: "#3F2911", borderHex: "#6B4226" },
  beigeTrousers: { name: "Beige Trousers", hex: "#D6C5AE", borderHex: "#CBA98D" },
  greyTrousers: { name: "Grey Trousers", hex: "#8E8B84", borderHex: "#6B4226" },
} as const;

export const weddingTheme = {
  paletteLabel: "Soft Cream, Warm Taupe, Rich Brown, and Dark Brown",
  paletteSentence: "soft cream, warm taupe, rich brown, and dark brown",
  colors: attireColors,
  motif: [
    attireColors.softCream,
    attireColors.warmTaupe,
    attireColors.richBrown,
    attireColors.darkBrown,
  ],
  guestAttire: [
    attireColors.softCream,
  ],
} as const;
