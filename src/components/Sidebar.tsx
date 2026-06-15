"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { wedding } from "@/data/wedding";
import styles from "./Sidebar.module.css";

const mobileMenuId = "mobile-navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <nav className={styles.nav}>
        <a
          href="#home"
          aria-label={`Home, ${wedding.couple.display}`}
          className={styles.logo}
          onClick={() => setIsOpen(false)}
        >
          {wedding.couple.monogram}
        </a>

        <div className={styles.links}>
          {wedding.navItems.map((item) => (
            <a key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </a>
          ))}
        </div>

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
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={styles.mobileLink}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
