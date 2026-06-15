"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { wedding } from "@/data/wedding";
import Section from "./Section";
import { Reveal } from "./animations/Reveal";
import styles from "./Entourage.module.css";

const entourage = wedding.entourage;
const preparationShoot = wedding.preparationShoot;

const parentGroups = [
  { label: "Bride's Parents", names: entourage.parents.members.slice(0, 2) },
  { label: "Groom's Parents", names: entourage.parents.members.slice(2, 4) },
];

const StaggerContainer = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.08,
          delayChildren: delay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const NameList = ({
  names,
  className = "",
}: {
  names: readonly string[];
  className?: string;
}) => (
  <StaggerContainer className={`${styles.nameList} ${className}`}>
    {names.map((name) => (
      <StaggerItem key={name}>
        <p className={styles.name}>{name}</p>
      </StaggerItem>
    ))}
  </StaggerContainer>
);

const BandHeader = ({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) => (
  <Reveal width="100%">
    <div className={styles.bandHeader}>
      <h3 className={styles.bandTitle}>{title}</h3>
      <p className={styles.bandCopy}>{copy}</p>
    </div>
  </Reveal>
);

const RoleCard = ({
  label,
  names,
  className = "",
}: {
  label: string;
  names: readonly string[];
  className?: string;
}) => (
  <article className={`${styles.roleCard} ${className}`}>
    <p className={styles.roleTitle}>{label}</p>
    <NameList names={names} />
  </article>
);

const SubgroupLabel = ({ children }: { children: ReactNode }) => (
  <p className={styles.subgroupLabel}>{children}</p>
);

const CeremonyRole = ({
  label,
  names,
}: {
  label: string;
  names: readonly string[];
}) => (
  <article className={styles.ceremonyRole}>
    <p className={styles.ceremonyRoleTitle}>{label}</p>
    <NameList names={names} className={styles.ceremonyNameList} />
  </article>
);

export default function Entourage() {
  return (
    <Section id="entourage" className={styles.section}>
      <div className={styles.inner}>
        <Reveal width="100%">
          <div className={styles.heading}>
            <p className={styles.eyebrow}>With Us</p>
            <h2 className={`${styles.title} script-balance`}>
              Wedding Entourage
            </h2>
            <div className={styles.rule} />
            <p className={styles.intro}>
              With heartfelt gratitude, we honor the family, sponsors, and friends
              who will stand with us on our wedding day.
            </p>
          </div>
        </Reveal>

        <div className={styles.programShell}>
          <section
            id="entourage-family"
            className={`${styles.programBand} ${styles.familyBand}`}
          >
            <BandHeader
              title="Our Parents"
              copy="With love and gratitude to the families who brought us to this day."
            />

            <div className={styles.parentGroupGrid}>
              {parentGroups.map((group) => (
                <article key={group.label} className={styles.parentGroup}>
                  <SubgroupLabel>{group.label}</SubgroupLabel>
                  <NameList names={group.names} className={styles.parentList} />
                </article>
              ))}
            </div>
          </section>

          <section
            id="entourage-sponsors"
            className={`${styles.programBand} ${styles.sponsorBand}`}
          >
            <BandHeader
              title={entourage.principalSponsors.title}
              copy="Witnessing our vows and guiding us as we begin married life."
            />

            {entourage.principalSponsors.showMembers ? (
              <NameList
                names={entourage.principalSponsors.members}
                className={styles.sponsorList}
              />
            ) : (
              <p className={styles.sponsorPlaceholder}>
                {entourage.principalSponsors.hiddenMessage}
              </p>
            )}
          </section>

          <section
            id="entourage-party"
            className={`${styles.programBand} ${styles.partyBand}`}
          >
            <BandHeader
              title="Attendants"
              copy="The people standing beside us as we exchange our vows."
            />

            <Reveal width="100%" delay={0.04}>
              <aside className={styles.prepNotice} aria-label="Entourage preparation shoot notice">
                <p className={styles.prepNoticeKicker}>{preparationShoot.status}</p>
                <h4 className={styles.prepNoticeTitle}>{preparationShoot.title}</h4>
                <dl className={styles.prepNoticeDetails}>
                  <div>
                    <dt>Call Time</dt>
                    <dd>{preparationShoot.time}</dd>
                  </div>
                  <div>
                    <dt>Needed</dt>
                    <dd>{preparationShoot.audience}</dd>
                  </div>
                </dl>
                <p className={styles.prepNoticeText}>{preparationShoot.description}</p>
                <p className={styles.prepNoticeText}>{preparationShoot.duration}</p>
              </aside>
            </Reveal>

            <div className={styles.honorGrid}>
              {entourage.mainParty.map((group) => (
                <RoleCard
                  key={group.role}
                  label={group.role}
                  names={group.names}
                  className={styles.honorCard}
                />
              ))}
            </div>

            <div className={styles.attendantGrid} aria-label="Groomsmen and bridesmaids">
              <RoleCard label="Groomsmen" names={entourage.groomsmen} />
              <RoleCard label="Bridesmaids" names={entourage.bridesmaids} />
            </div>
          </section>

          <section
            id="entourage-roles"
            className={`${styles.programBand} ${styles.ceremonyBand}`}
          >
            <BandHeader
              title="Ceremony Roles"
              copy="Family and friends taking part in the ceremony traditions and procession."
            />

            <div className={styles.roleCluster}>
              <div className={styles.ceremonyGrid}>
                {entourage.secondarySponsors.map((group) => (
                  <CeremonyRole
                    key={group.role}
                    label={group.role}
                    names={group.names}
                  />
                ))}
              </div>
            </div>

            <div className={styles.roleCluster}>
              <div className={styles.ceremonyGrid}>
                {entourage.bearers.map((group) => (
                  <CeremonyRole
                    key={group.role}
                    label={group.role}
                    names={group.names}
                  />
                ))}

                <CeremonyRole label="Flower Girls" names={entourage.flowerGirls} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </Section>
  );
}
