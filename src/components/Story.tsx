"use client";

import { Heart } from "lucide-react";
import { wedding } from "@/data/wedding";
import Section from "./Section";
import { Reveal } from "./animations/Reveal";
import styles from "./Story.module.css";

const story = wedding.story;

export default function Story() {
  return (
    <Section id="story" className={styles.section}>
      <div className={styles.inner}>
        <Reveal width="100%">
          <div className={styles.placeholderPanel}>
            <span className={styles.storyMark} aria-hidden="true">
              <Heart size={16} strokeWidth={1.6} />
            </span>
            <p className={styles.eyebrow}>{story.eyebrow}</p>
            <h2 className={`${styles.title} script-balance`}>{story.title}</h2>
            <div className={styles.rule} />
            <p className={styles.intro}>{story.intro}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
