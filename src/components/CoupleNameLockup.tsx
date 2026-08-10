import Image from "next/image";
import styles from "./CoupleNameLockup.module.css";

type CoupleNameLockupProps = {
  className?: string;
  firstName: string;
  priority?: boolean;
  secondName: string;
};

export default function CoupleNameLockup({
  className,
  firstName,
  priority = false,
  secondName,
}: CoupleNameLockupProps) {
  return (
    <span
      className={`${styles.lockup}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <Image
        src="/brand/icon-light.svg"
        alt=""
        className={styles.icon}
        width={1714}
        height={918}
        priority={priority}
      />
      <span className={styles.names}>
        <span>{firstName}</span>
        <span className={styles.ampersand}>&amp;</span>
        <span>{secondName}</span>
      </span>
    </span>
  );
}
