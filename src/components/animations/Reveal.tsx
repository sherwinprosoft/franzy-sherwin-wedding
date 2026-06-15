"use client";

import { motion, useInView, useAnimation, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

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
  delay = 0.2, 
  duration = 0.8,
  yOffset = 75,
  overflow = "hidden",
}: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const mainControls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isInView || shouldReduceMotion) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls, shouldReduceMotion]);

  return (
    <div ref={ref} className={className} style={{ position: "relative", width, overflow }}>
      <motion.div
        className={contentClassName}
        variants={{
          hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset },
          visible: { opacity: 1, y: 0 },
        }}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate={mainControls}
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
