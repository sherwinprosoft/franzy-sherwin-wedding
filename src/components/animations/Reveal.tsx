"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  yOffset?: number;
  overflow?: "hidden" | "visible";
}

export const Reveal = ({ 
  children, 
  className,
  contentClassName,
  width = "fit-content", 
  delay = 0.08,
  duration = 0.7,
  yOffset = 28,
  overflow = "hidden",
}: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref} className={className} style={{ position: "relative", width, overflow }}>
      <motion.div
        className={contentClassName}
        variants={{
          hidden: { opacity: 0, y: yOffset },
          visible: { opacity: 1, y: 0 },
        }}
        // Keep initial styles identical during hydration; apply preferences through animate.
        initial="hidden"
        animate={shouldReduceMotion || isInView ? "visible" : "hidden"}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration, delay, ease: [0.22, 1, 0.36, 1] }
        }
      >
        {children}
      </motion.div>
    </div>
  );
};
