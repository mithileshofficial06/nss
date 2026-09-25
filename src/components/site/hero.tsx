"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { NssWheel } from "@/components/ui/nss-wheel";
import { Magnetic } from "@/components/ui/motion";

const layers = [
  { src: "/images/events/beach-cleanup-2025.webp", className: "left-[4%] top-[18%] w-44 sm:w-60 rotate-[-8deg]", depth: 30 },
  { src: "/images/events/blood-donation-2026.webp", className: "right-[3%] top-[14%] w-40 sm:w-56 rotate-[7deg]", depth: 45 },
  { src: "/images/events/blanket-donation-2025.webp", className: "right-[8%] bottom-[12%] w-36 sm:w-52 rotate-[-5deg]", depth: 60 },
  { src: "/images/events/road-safety-rally-2026.webp", className: "left-[8%] bottom-[10%] w-40 sm:w-56 rotate-[6deg]", depth: 38 },
];

function Layer({ src, className, depth, mx, my, index }: (typeof layers)[number] & { mx: ReturnType<typeof useSpring>; my: ReturnType<typeof useSpring>; index: number }) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div
      className={`absolute hidden aspect-[4/5] overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl shadow-black/50 md:block ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, delay: 0.5 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image src={src} alt="" fill sizes="240px" className="object-cover" priority />
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useSpring(px, { stiffness: 60, damping: 18 });
  const my = useSpring(py, { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const wheelRotate = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={ref}
      className="grain relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-navy-950 text-white"
      onPointerMove={(e) => {
        px.set(e.clientX / window.innerWidth - 0.5);
        py.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      {/* glows */}
      <div className="absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-nss-red/30 blur-[140px]" />
      <div className="absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-navy-600/40 blur-[120px]" />

      <motion.div style={{ rotate: wheelRotate }} className="absolute inset-0 grid place-items-center">
        <NssWheel spin className="h-[130vmin] w-[130vmin] text-white/[0.045]" strokeWidth={1.5} />
      </motion.div>

      {layers.map((l, i) => (
        <Layer key={l.src} {...l} mx={mx} my={my} index={i} />
      ))}

      <motion.div style={{ y: titleY, opacity: fade }} className="relative z-10 mx-auto max-w-5xl px-6 pt-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          National Service Scheme · LICET
        </motion.p>

        <h1 className="mt-8 font-display text-[15vw] font-extrabold uppercase leading-[0.85] tracking-[-0.04em] sm:text-[11vw] lg:text-[9.5rem]">
          {["Not me,", "but you"].map((line, li) => (
            <span key={line} className="block overflow-hidden pb-2">
              <motion.span
                className={`block ${li === 1 ? "text-nss-red" : ""}`}
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, delay: 0.3 + li * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
        >
          Beach clean-ups, blood drives, rallies and outreach — a community of LICET volunteers who show up for Chennai.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-nss-red px-7 py-4 font-bold shadow-[0_0_40px_-5px] shadow-nss-red/60 transition hover:bg-ember"
            >
              Become a volunteer
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/events" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 font-bold backdrop-blur transition hover:bg-white hover:text-navy-950">
              See events
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.a
        href="#stats"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Scroll
        <ArrowDown size={16} />
      </motion.a>
    </section>
  );
}
