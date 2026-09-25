"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Editorial section head: a full-width rule that draws in, label on the left, index on the right. */
export function SectionLabel({ index, label, tone = "dark", className }: { index: string; label: string; tone?: "dark" | "light"; className?: string }) {
  const onDark = tone === "light";
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className={cn("font-display text-[15px] font-medium", className)}>
      <motion.div
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease } } }}
        className={cn("h-px origin-left", onDark ? "bg-white/40" : "bg-ink")}
      />
      <motion.div
        variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease } } }}
        className={cn("flex justify-between pt-3", onDark ? "text-white" : "text-ink")}
      >
        <span>{label}</span>
        <span className={onDark ? "text-white/50" : "text-ink/45"}>({index})</span>
      </motion.div>
    </motion.div>
  );
}
