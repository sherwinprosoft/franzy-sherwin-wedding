import Image from "next/image";

type BrandAsset = "icon" | "monogram" | "wordmark";
type BrandTone = "dark" | "light";

type WeddingBrandMarkProps = {
  asset?: BrandAsset;
  className?: string;
  label?: string;
  priority?: boolean;
  tone?: BrandTone;
};

const dimensions: Record<BrandAsset, { height: number; width: number }> = {
  icon: { width: 194, height: 104 },
  monogram: { width: 194, height: 130 },
  wordmark: { width: 710, height: 117 },
};

const assetVersion = "coda-continuum-20260810-23";

export default function WeddingBrandMark({
  asset = "monogram",
  className,
  label,
  priority = false,
  tone = "light",
}: WeddingBrandMarkProps) {
  const { height, width } = dimensions[asset];

  return (
    <Image
      src={`/brand/${asset}-${tone}.svg?v=${assetVersion}`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={className}
      width={width}
      height={height}
      priority={priority}
    />
  );
}
