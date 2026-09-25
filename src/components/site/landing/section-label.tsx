"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** "01 ── Who we are" eyebrow: index, a line that draws in, then the label. */
export function SectionLabel({ index, label, tone = "dark", className }: { index: string; label: string; tone?: "dark" | "light"; className?: string }) {
  const onDark = tone === "light";
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={cn("flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em]", onDark ? "text-white/60" : "text-navy-900/55", className)}
    >
      <motion.span variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="text-nss-red">
        {index}
      </motion.span>
      <motion.span
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
        className={cn("h-px w-10 origin-left", onDark ? "bg-white/30" : "bg-navy-900/25")}
      />
      <motion.span variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { delay: 0.3 } } }}>{label}</motion.span>
    </motion.div>
  );
}
