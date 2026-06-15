"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  delay?: number;
}

export default function Section({ children, id, className = "", delay = 0 }: SectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, delay }}
      className={`px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 ${className}`}
    >
      {children}
    </motion.section>
  );
}
