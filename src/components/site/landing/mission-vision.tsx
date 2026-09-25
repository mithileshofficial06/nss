"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Compass, Eye, Quote } from "lucide-react";
import { SectionLabel } from "./section-label";

const ease = [0.22, 1, 0.36, 1] as const;

const STATEMENT =
  "The National Service Scheme is a Government of India programme under the Ministry of Youth Affairs & Sports. At LICET, it is where future engineers learn that the problems worth solving are human ones.";

const missions = [
  "Engage students in meaningful service that responds to the real needs of the community.",
  "Build civic responsibility, empathy and leadership through hands-on volunteering.",
  "Partner with communities, NGOs and public bodies for lasting, sustainable impact.",
  "Promote health, environmental and social awareness alongside national integration.",
];

export function MissionVision() {
  return (
    <section id="mission" className="relative overflow-hidden bg-paper py-28 sm:py-36">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(46,49,145,.08),transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionLabel index="01" label="Who we are" />
        <ScrollStatement text={STATEMENT} />

        <div className="mt-24 grid gap-6 lg:grid-cols-2">
          <VisionCard />
          <MissionCard />
        </div>

        <MottoBand />
      </div>
    </section>
  );
}

/** Words fill from faint to full ink as the paragraph scrolls through the viewport. */
function ScrollStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="mt-8 max-w-5xl font-display text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-navy-900">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} highlight={/LICET|human/.test(w)}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range, highlight }: { children: string; progress: MotionValue<number>; range: [number, number]; highlight: boolean }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className={highlight ? "font-serif font-normal italic text-nss-red" : undefined}>
      {children}{" "}
    </motion.span>
  );
}

function VisionCard() {
  return (
    <motion.article
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] bg-navy-900 p-8 text-white shadow-[0_40px_80px_-40px_rgba(8,12,43,.8)] sm:p-12"
    >
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-navy-600/60 blur-3xl transition-transform duration-700 group-hover:scale-125" />
      <Image
        src="/brand/nss-logo.png"
        alt=""
        width={320}
        height={320}
        className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 opacity-[0.07] transition-transform duration-[1.5s] group-hover:rotate-45"
      />
      <div className="relative">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <Eye size={22} className="text-accent" />
        </span>
        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/50">Our vision</p>
        <h3 className="mt-4 font-serif text-[clamp(1.9rem,3vw,2.6rem)] leading-[1.15]">
          To develop the personality and character of students through <em className="text-ember">voluntary community service</em> — shaping citizens who
          put community before self.
        </h3>
      </div>
      <p className="relative mt-auto flex items-center gap-3 pt-10 text-[13px] text-white/45">
        <span className="h-px w-8 bg-white/25" />
        Inspired by the aim of the National Service Scheme
      </p>
    </motion.article>
  );
}

function MissionCard() {
  return (
    <motion.article
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, delay: 0.1, ease }}
      whileHover={{ y: -6 }}
      className="relative overflow-hidden rounded-[28px] border border-line bg-white p-8 shadow-[0_40px_80px_-50px_rgba(8,12,43,.45)] sm:p-12"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-nss-red/10">
        <Compass size={22} className="text-nss-red" />
      </span>
      <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.22em] text-navy-900/50">Our mission</p>
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
        className="mt-6 space-y-5"
      >
        {missions.map((m, i) => (
          <motion.li
            key={i}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
            className="flex gap-4 border-b border-line pb-5 last:border-0 last:pb-0"
          >
            <span className="font-display text-sm font-bold text-nss-red">0{i + 1}</span>
            <span className="text-[16px] leading-relaxed text-navy-900/80">{m}</span>
          </motion.li>
        ))}
      </motion.ol>
    </motion.article>
  );
}

function MottoBand() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease }}
      className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-nss-red to-nss-red-dark p-8 text-white sm:p-12"
    >
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,.12)_50%,transparent_60%)] bg-[length:250%_100%] animate-shimmer" />
      <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-4">
          <Quote size={40} className="shrink-0 opacity-50" />
          <p className="font-serif text-[clamp(2.25rem,4vw,3.5rem)] leading-none">
            Not Me, <em>But You</em>
          </p>
        </div>
        <p className="max-w-2xl text-[15px] leading-relaxed text-white/85 md:border-l md:border-white/25 md:pl-8">
          The NSS motto reflects the essence of democratic living — the need for selfless service, for appreciating another person&apos;s point of view,
          and for showing consideration to fellow human beings.
        </p>
      </div>
    </motion.div>
  );
}
