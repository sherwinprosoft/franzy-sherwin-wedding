import preweddingPhotoManifest from "./prewedding-photos.json";

export type PhotoLayout = "landscape" | "portrait";

export type PhotoAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  layout: PhotoLayout;
  objectPosition?: string;
};

export const galleryPhotos: PhotoAsset[] = preweddingPhotoManifest.map(
  (photo): PhotoAsset => ({
    ...photo,
    layout: photo.layout === "portrait" ? "portrait" : "landscape",
  }),
);
