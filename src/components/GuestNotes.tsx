"use client";

import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { wedding } from "@/data/wedding";
import Section from "./Section";
import { Reveal } from "./animations/Reveal";
import styles from "./GuestNotes.module.css";

const attireGuide = wedding.attireGuide;

type AttirePreview = {
  src: string;
  alt: string;
  position: string;
  role: string;
  attire: string;
};

function getAttireRoleNote(group: object) {
  if (!("note" in group)) {
    return null;
  }

  const note = group.note;

  return typeof note === "string" && note.trim().length > 0
    ? note
    : null;
}

export default function GuestNotes() {
  const [selectedPreview, setSelectedPreview] = useState<AttirePreview | null>(null);

  useEffect(() => {
    if (!selectedPreview) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPreview(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPreview]);

  return (
    <Section id="notes" className={styles.section}>
      <div className={styles.inner}>
        <Reveal width="100%">
          <div className={styles.heading}>
            <p className={styles.eyebrow}>
              Guest Guide
            </p>
            <h2 className={`${styles.title} script-balance`}>
              Attire & Gifts
            </h2>
            <div className={styles.rule} />
            <p className={styles.intro}>
              {attireGuide.intro}
            </p>
          </div>
        </Reveal>

        <Reveal width="100%" delay={0.08}>
          <section id="attire" className={styles.guestStrip} aria-labelledby="guest-attire-heading">
            <div className={styles.guestCopy}>
              <p className={styles.kicker}>{attireGuide.guest.eyebrow}</p>
              <h3 id="guest-attire-heading" className={styles.guestTitle}>
                {attireGuide.guest.title}
              </h3>
              <p className={styles.guestText}>{attireGuide.guest.description}</p>
            </div>
            <ul className={styles.attireSwatches} aria-label="Encouraged guest attire colors">
              {attireGuide.guest.swatches.map((color) => (
                <li key={color.name} className={styles.attireSwatchItem}>
                  <span
                    className={styles.attireSwatch}
                    style={{ backgroundColor: color.hex, borderColor: color.borderHex }}
                    aria-hidden="true"
                  />
                  <span>{color.name}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <div className={styles.guideGrid}>
          <Reveal
            width="100%"
            className={`${styles.guideReveal} ${styles.attireGuideReveal}`}
            contentClassName={styles.guideRevealContent}
          >
            <section className={styles.attireGuidePanel} aria-labelledby="entourage-attire-heading">
              <div className={styles.referenceIntro}>
                <p className={styles.attireGroupLabel}>{attireGuide.entourage.eyebrow}</p>
                <h3 id="entourage-attire-heading" className={styles.referenceTitle}>
                  {attireGuide.entourage.title}
                </h3>
                <p className={styles.referenceText}>
                  {attireGuide.entourage.description}
                </p>
              </div>

              <div className={styles.attireColumnGrid}>
                {attireGuide.entourage.columns.map((column) => (
                  <article key={column.title} className={styles.attireColumn}>
                    <div className={styles.attireColumnHeader}>
                      <h4 className={styles.attireColumnTitle}>{column.title}</h4>
                      <p className={styles.attireColumnText}>{column.description}</p>
                    </div>

                    {column.callout ? (
                      <p className={styles.attireCallout}>{column.callout}</p>
                    ) : null}

                    <div className={styles.attireRoleList}>
                      {column.roles.map((group) => {
                        const note = getAttireRoleNote(group);

                        return (
                          <section
                            key={group.role}
                            className={`${styles.attireRole} ${
                              group.previews.length > 1 ? styles.attireRoleMultiPreview : ""
                            }`}
                          >
                            <span
                              className={styles.attireRoleColorBar}
                              style={{
                                background: `linear-gradient(180deg, ${group.swatches[0].hex}, ${group.swatches[0].borderHex})`,
                              }}
                              aria-hidden="true"
                            />
                            <div className={styles.attireRoleCopy}>
                              <p className={styles.attireRoleKicker}>Choose this row for</p>
                              <h5 className={styles.attireRoleTitle}>{group.role}</h5>
                              <p className={styles.attireRoleAttire}>{group.attire}</p>
                              {note ? (
                                <p className={styles.attireRoleNote}>{note}</p>
                              ) : null}
                            </div>
                            <ul
                              className={styles.roleSwatches}
                              aria-label={`${group.role} attire colors`}
                            >
                              {group.swatches.map((swatch) => (
                                <li key={swatch.name} className={styles.roleSwatchItem}>
                                  <span
                                    className={styles.roleSwatch}
                                    style={{ backgroundColor: swatch.hex, borderColor: swatch.borderHex }}
                                    aria-hidden="true"
                                  />
                                  <span>{swatch.name}</span>
                                </li>
                              ))}
                            </ul>
                            <div
                              className={`${styles.attireRolePreviewGrid} ${
                                group.previews.length > 1 ? styles.attireRolePreviewGridSplit : ""
                              }`}
                            >
                              {group.previews.map((preview) => (
                                <button
                                  key={preview.alt}
                                  type="button"
                                  className={styles.attireRolePreviewFrame}
                                  onClick={() =>
                                    setSelectedPreview({
                                      src: preview.src,
                                      alt: preview.alt,
                                      position: preview.position,
                                      role: group.role,
                                      attire: group.attire,
                                    })
                                  }
                                  aria-label={`Enlarge ${group.role} attire reference`}
                                >
                                  <Image
                                    src={preview.src}
                                    alt={preview.alt}
                                    fill
                                    sizes="(min-width: 1024px) 13rem, (min-width: 640px) 30vw, 90vw"
                                    className={styles.attireRolePreviewImage}
                                    style={{ objectPosition: preview.position }}
                                    loading="eager"
                                    unoptimized
                                  />
                                  <span className={styles.previewZoomHint} aria-hidden="true">
                                    <Maximize2 size={15} strokeWidth={2} />
                                  </span>
                                </button>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        <Reveal width="100%" delay={0.24}>
          <section id="gifts" className={styles.giftPanel} aria-labelledby="gift-note-heading">
            <h3 id="gift-note-heading" className={`${styles.giftTitle} script-balance`}>
              {wedding.giftNote.title}
            </h3>
            <p className={styles.giftHeadline}>{wedding.giftNote.headline}</p>
            <div className={styles.giftDivider} aria-hidden="true" />
            <p className={styles.giftText}>{wedding.giftNote.description}</p>
          </section>
        </Reveal>
      </div>

      {selectedPreview ? (
        <div
          className={styles.previewModal}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedPreview.role} attire reference`}
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className={styles.previewModalPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.previewModalClose}
              onClick={() => setSelectedPreview(null)}
              aria-label="Close attire reference"
            >
              <X size={20} strokeWidth={2} />
            </button>
            <div className={styles.previewModalImageFrame}>
              <Image
                src={selectedPreview.src}
                alt={selectedPreview.alt}
                fill
                sizes="100vw"
                className={styles.previewModalImage}
                style={{ objectPosition: selectedPreview.position }}
                unoptimized
              />
            </div>
            <div className={styles.previewModalCaption}>
              <p>{selectedPreview.role}</p>
              <h4>{selectedPreview.attire}</h4>
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
