"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Newspaper-style section front: a heavy rule draws in, the section number pops in red,
 * and the poster-type title rises letter by letter while gliding in from the right, settling on the grid.
 */
export function SectionTitle({ index, title, caption }: { index: string; title: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // One-way drift that ends at 0, so the title never overhangs the left margin
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const x = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const words = title.toUpperCase().split(" ");
  let letterIndex = 0;

  return (
    <motion.div ref={ref} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="overflow-x-clip">
      <motion.div variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease } } }} className="h-[3px] origin-left bg-ink" />

      <div className="mt-4 flex items-center justify-between font-display text-[15px] font-medium">
        <span className="flex items-center gap-2.5">
          <motion.span
            variants={{ hidden: { scale: 0, rotate: -90 }, show: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 18, delay: 0.25 } } }}
            className="h-3 w-3 bg-nss-red"
          />
          <motion.span variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { delay: 0.35 } } }} className="text-nss-red">
            Section {index}
          </motion.span>
        </span>
        {caption && (
          <motion.span variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.5 } } }} className="text-ink/50">
            {caption}
          </motion.span>
        )}
      </div>

      <motion.h2
        style={{ x }}
        aria-label={title}
        className="mt-2 font-poster text-[clamp(3.6rem,11vw,10.5rem)] uppercase leading-[0.88] tracking-[-0.01em] text-ink"
      >
        {words.map((word, w) => (
          <span key={w} aria-hidden className="mr-[0.22em] inline-flex overflow-hidden pb-[0.04em] last:mr-0">
            {word.split("").map((ch) => {
              const i = letterIndex++;
              return (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.9, delay: 0.15 + i * 0.035, ease } } }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.h2>
    </motion.div>
  );
}
