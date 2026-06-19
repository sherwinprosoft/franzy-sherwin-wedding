"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { wedding } from "@/data/wedding";
import { WeddingAudioControl } from "./WeddingAudio";
import styles from "./Sidebar.module.css";

const mobileMenuId = "mobile-navigation";

type SidebarProps = {
  solid?: boolean;
};

export default function Sidebar({ solid = false }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isSolid = solid || isScrolled;

  useEffect(() => {
    const updateHeader = () => {
      setIsScrolled(window.scrollY > 4);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktopQuery.matches) {
        setIsOpen(false);
      }
    };

    closeOnDesktop();
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header className={`${styles.header} ${isSolid ? styles.scrolled : ""}`}>
      <nav className={styles.nav}>
        <Link
          href="/#home"
          aria-label={`Home, ${wedding.couple.display}`}
          className={styles.logo}
          onClick={() => setIsOpen(false)}
        >
          {wedding.couple.monogram}
        </Link>

        <div className={styles.links}>
          {wedding.navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.mobileControls}>
          <WeddingAudioControl variant="header" />
          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-controls={mobileMenuId}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
            className={styles.toggle}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={mobileMenuId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={styles.mobileMenu}
          >
            <div className={styles.mobileMenuList}>
              {wedding.navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={styles.mobileLink}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
