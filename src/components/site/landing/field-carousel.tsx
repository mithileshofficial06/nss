"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "./section-title";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

import type { Slide } from "@/lib/content";

/**
 * Framed, stacked photo carousel: a white panel inset over the full-bleed current photo,
 * with the previous / current / next shots stacked as offset strips.
 */
export function FieldCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), 4500);
    return () => clearInterval(id);
  }, [go, paused, index]);

  // Frame opens up as the section scrolls into view
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const inset = useTransform(scrollYProgress, [0, 1], [72, 32]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);

  const cur = slides[index];
  const prev = slides[(index - 1 + n) % n];
  const next = slides[(index + 1) % n];

  return (
    <div id="in-the-field" className="bg-white pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8">
        <SectionTitle index="02" title="In the field" caption="Drives, rallies & outreach, 2024–26" />
      </div>
      <section
        ref={ref}
        aria-roledescription="carousel"
        aria-label="NSS in the field"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative overflow-hidden"
      >
        {/* Full-bleed backdrop: the current photo */}
        <motion.div style={{ scale: bgScale }} className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div key={cur.src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0">
              <Image src={cur.src} alt="" fill sizes="100vw" className="object-cover" priority />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div style={{ padding: inset }} className="relative">
          <div className="relative flex min-h-[640px] flex-col overflow-hidden bg-white px-5 py-4 font-display text-[15px] font-medium text-ink sm:min-h-[760px] sm:px-6 lg:h-[calc(100svh-64px)] lg:max-h-[900px]">
            {/* Backdrop word for the current photo */}
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={cur.word}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 0.8, ease }}
                  className="whitespace-nowrap font-poster text-[clamp(7rem,33vw,34rem)] uppercase leading-none tracking-[0.02em] text-navy-600/[0.09]"
                >
                  {cur.word}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="relative flex items-center justify-between">
              <span>Photo stories</span>
              <Link href="/gallery" className="transition-colors hover:text-nss-red">
                Gallery ↗
              </Link>
            </div>

            <div className="relative grid flex-1 grid-cols-1 items-center gap-6 py-4 lg:grid-cols-[1fr_minmax(0,3.2fr)_1fr]">
              {/* Caption */}
              <div className="order-2 min-h-[3.5rem] lg:order-none">
                <AnimatePresence mode="wait">
                  <motion.div key={cur.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease }}>
                    <span className="mb-3 block h-[3px] w-10 bg-nss-red" />
                    <p className="font-serif text-[clamp(2rem,3vw,3.2rem)] font-normal leading-[0.95] text-ink">{cur.title}</p>
                    <p className="mt-3 text-[14px] font-semibold uppercase tracking-[0.1em] text-nss-red">{cur.meta}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Stacked strips */}
              <button
                onClick={() => go(1)}
                data-cursor="Next"
                aria-label={`Show next photo: ${next.title}`}
                className="order-1 mx-auto flex h-full w-full max-w-[760px] flex-col items-center justify-center gap-3 lg:order-none"
              >
                <Strip slide={prev} className="h-[14%] min-h-[64px] w-[70%]" position="bottom" />
                <Strip slide={cur} className="h-[56%] min-h-[260px] w-full" position="center" main />
                <Strip slide={next} className="h-[14%] min-h-[64px] w-[70%]" position="top" />
              </button>

              {/* Counter */}
              <p className="order-3 font-poster tabular-nums leading-none text-navy-600 lg:order-none lg:text-right">
                <AnimatePresence mode="wait">
                  <motion.span key={index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="inline-block text-[clamp(3.5rem,6vw,6rem)]">
                    {String(index + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[clamp(1.4rem,2vw,2rem)] text-ink/35">/{String(n).padStart(2, "0")}</span>
              </p>
            </div>

            <div className="relative flex items-end justify-between gap-4">
              <span>Est. 1969 · Government of India</span>
              <span className="flex items-center gap-4">
                <button onClick={() => go(-1)} className="transition-colors hover:text-nss-red">
                  Prev
                </button>
                <span className="h-3 w-px bg-ink/20" />
                <button onClick={() => go(1)} className="transition-colors hover:text-nss-red">
                  Next
                </button>
              </span>
              <span className="hidden text-right sm:block">Volunteer-run in Chennai.</span>
            </div>
            {/* Autoplay progress */}
            <div className="relative mt-3 h-px bg-ink/10">
              <motion.div key={`${index}-${paused}`} className="h-full origin-left bg-nss-red" initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 0 : 1 }} transition={{ duration: paused ? 0.2 : 4.5, ease: "linear" }} />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function Strip({ slide, className, position, main = false }: { slide: Slide; className: string; position: "top" | "center" | "bottom"; main?: boolean }) {
  // Spans (display:block) rather than divs: these live inside the carousel's <button>
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <AnimatePresence initial={false}>
        <motion.span
          key={slide.src}
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: main ? 1 : 0.8, delay: main ? 0.1 : 0, ease }}
          className="absolute inset-0 block"
        >
          <motion.span initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease }} className="absolute inset-0 block">
            <Image
              src={slide.src}
              alt={main ? slide.title : ""}
              fill
              sizes={main ? "(max-width: 1024px) 100vw, 760px" : "540px"}
              className="object-cover"
              style={{ objectPosition: `center ${position}` }}
            />
          </motion.span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
