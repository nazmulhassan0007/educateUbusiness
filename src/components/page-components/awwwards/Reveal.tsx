"use client";

import { motion } from "motion/react";
import { EASE } from "./types";

/** Heavy fade-up with a blur, used for section headings across the page. */
export default function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 1, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** A list item that fades up in turn with its siblings as the list scrolls in. */
export function RiseItem({ children, className, index = 0 }: { children: React.ReactNode; className?: string; index?: number }) {
  return (
    <motion.li
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.07, ease: EASE }}
    >
      {children}
    </motion.li>
  );
}
