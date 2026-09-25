"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CountUp, Magnetic } from "@/components/ui/motion";

const ease = [0.22, 1, 0.36, 1] as const;

type Stats = { events: number; batches: number };
type NextEvent = { title: string; slug: string } | null;

export function Hero({ stats, nextEvent }: { stats: Stats; nextEvent: NextEvent }) {
  const ref = useRef<HTMLElement>(null);

  // Pointer: drives the spotlight and the parallax on the emblem composition
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.3);
  const sx = useSpring(px, { stiffness: 50, damping: 20 });
  const sy = useSpring(py, { stiffness: 50, damping: 20 });
  const spotX = useTransform(sx, (v) => `${v * 100}%`);
  const spotY = useTransform(sy, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${spotX} ${spotY}, rgba(46,49,145,.45), transparent 70%)`;

  // Scroll: content lifts away, emblem recedes
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const emblemScale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const emblemRotate = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const emblemY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-navy-950 pt-[72px] text-white"
    >
      {/* Background layers */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#1b2370_0%,transparent_55%)]" />
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute -bottom-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-nss-red/20 blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:py-0">
        {/* Copy */}
        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] py-1.5 pl-1.5 pr-4 backdrop-blur"
          >
            <Image src="/brand/licet-logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full bg-white" />
            <span className="text-[12px] font-medium tracking-wide text-white/75">
              Loyola-ICAM College of Engineering &amp; Technology
              <span className="mx-2 text-white/25">|</span>
              <span className="text-accent">NSS Unit</span>
            </span>
          </motion.div>

          <h1 className="mt-8 font-display text-[clamp(3.25rem,7.4vw,7rem)] font-bold leading-[0.95] tracking-[-0.035em]">
            <MaskLine delay={0.35}>Not me,</MaskLine>
            <MaskLine delay={0.5}>
              but <span className="font-serif text-[1.08em] font-normal italic tracking-[-0.01em] text-ember">you.</span>
            </MaskLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.85, ease }}
            className="mt-7 max-w-xl text-[17px] leading-relaxed text-white/65"
          >
            The National Service Scheme at LICET turns students into changemakers — through clean-up drives, blood donation camps, awareness rallies and
            community outreach across Chennai.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Magnetic strength={0.25}>
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-nss-red px-7 py-4 text-[15px] font-semibold shadow-[0_12px_40px_-10px_rgba(225,29,42,.8)]"
              >
                <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-out group-hover:translate-y-0" />
                <span className="relative transition-colors duration-500 group-hover:text-nss-red">Become a volunteer</span>
                <ArrowRight size={18} className="relative transition-all duration-500 group-hover:translate-x-1 group-hover:text-nss-red" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link
                href="/events"
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 py-4 text-[15px] font-semibold backdrop-blur transition hover:border-white/40 hover:bg-white/10"
              >
                Explore events
                <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
          </motion.div>

          <motion.dl
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 1.25 } } }}
            className="mt-14 grid max-w-lg grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-7"
          >
            {[
              { value: 1969, label: "NSS founded", plain: true },
              { value: stats.events, label: "Drives & events" },
              { value: stats.batches, label: "Active batches" },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
                className="flex flex-col-reverse px-5 first:pl-0"
              >
                <dt className="mt-1 text-[12px] font-medium text-white/50">{s.label}</dt>
                <dd className="font-display text-3xl font-bold tracking-tight">{s.plain ? s.value : <CountUp to={s.value} suffix="+" />}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Emblem composition */}
        <motion.div style={{ scale: emblemScale, rotate: emblemRotate, y: emblemY }} className="relative mx-auto aspect-square w-full max-w-[520px]">
          <Emblem mx={sx} my={sy} nextEvent={nextEvent} />
        </motion.div>
      </div>

      <ScrollCue />
    </section>
  );
}

function MaskLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={{ y: "110%", rotate: 3 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ duration: 1.1, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const MOTTO = "NOT ME BUT YOU • NATIONAL SERVICE SCHEME • LICET • ";

/** Parallax offset for one depth layer: deeper layers travel further with the pointer. */
function useShift(mx: MotionValue<number>, my: MotionValue<number>, depth: number) {
  return { x: useTransform(mx, [0, 1], [-depth, depth]), y: useTransform(my, [0, 1], [-depth, depth]) };
}

function Emblem({ mx, my, nextEvent }: { mx: MotionValue<number>; my: MotionValue<number>; nextEvent: NextEvent }) {
  const near = useShift(mx, my, 28);
  const mid = useShift(mx, my, 16);
  const far = useShift(mx, my, 8);

  return (
    <div className="absolute inset-0">
      {/* Orbit rings that draw themselves */}
      <motion.svg style={far} viewBox="0 0 520 520" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
        {[250, 205].map((r, i) => (
          <motion.circle
            key={r}
            cx="260"
            cy="260"
            r={r}
            stroke="rgba(169,177,255,.22)"
            strokeWidth="1"
            strokeDasharray={i === 0 ? "2 8" : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.4 + i * 0.3, ease }}
          />
        ))}
      </motion.svg>

      {/* Orbiting dots */}
      <motion.div style={far} className="absolute inset-0 animate-[spin_24s_linear_infinite]" aria-hidden>
        <span className="absolute left-1/2 top-[2%] h-3 w-3 -translate-x-1/2 rounded-full bg-nss-red shadow-[0_0_24px_4px_rgba(225,29,42,.7)]" />
      </motion.div>
      <motion.div style={far} className="absolute inset-[10%] animate-[spin_18s_linear_infinite_reverse]" aria-hidden>
        <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_20px_4px_rgba(169,177,255,.6)]" />
      </motion.div>

      {/* Rotating motto ring + emblem */}
      <motion.div
        style={mid}
        initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.4, delay: 0.3, ease }}
        className="absolute inset-[17%]"
      >
        <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full animate-[spin_40s_linear_infinite]" aria-hidden>
          <defs>
            <path id="motto-ring" d="M150,150 m-132,0 a132,132 0 1,1 264,0 a132,132 0 1,1 -264,0" />
          </defs>
          {/* textLength = ring circumference (2π·132), so the phrase closes exactly on itself */}
          <text className="fill-white/55 font-display text-[13px] font-semibold">
            <textPath href="#motto-ring" textLength={829} lengthAdjust="spacing">
              {MOTTO}
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-[16%] rounded-full bg-white/[0.03] p-3 ring-1 ring-white/10 backdrop-blur-sm">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(46,49,145,.6),transparent_70%)] blur-2xl" />
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative h-full w-full">
            <Image
              src="/brand/nss-logo.png"
              alt="National Service Scheme emblem"
              fill
              priority
              sizes="(max-width: 1024px) 60vw, 300px"
              className="rounded-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,.5)]"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating photo cards */}
      <PhotoCard style={near} src="/images/events/beach-cleanup-2025.webp" label="Beach Clean-Up" date="Nov 2025" className="-left-[4%] top-[6%] w-[34%] -rotate-6" delay={1.0} />
      <PhotoCard style={near} src="/images/events/blood-donation-2026.webp" label="Blood Donation" date="Jan 2026" className="-right-[2%] bottom-[8%] w-[36%] rotate-[5deg]" delay={1.2} />
      {nextEvent && (
        <motion.div
          style={mid}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 1.45, ease }}
          className="absolute -right-[3%] top-[16%] hidden sm:block"
        >
          <Link
            href={`/events/${nextEvent.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.12]"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">Next up</p>
            <p className="mt-0.5 max-w-[12rem] truncate text-sm font-semibold">{nextEvent.title}</p>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

function PhotoCard({
  src,
  label,
  date,
  className,
  delay,
  style,
}: {
  src: string;
  label: string;
  date: string;
  className: string;
  delay: number;
  style: { x: MotionValue<number>; y: MotionValue<number> };
}) {
  return (
    <motion.div style={style} className={`absolute hidden sm:block ${className}`}>
      <motion.figure
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay, ease }}
        whileHover={{ scale: 1.05, rotate: 0 }}
        className="overflow-hidden rounded-2xl border border-white/15 bg-navy-900 p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image src={src} alt={label} fill sizes="200px" className="object-cover" />
        </div>
        <figcaption className="flex items-center justify-between px-2 pb-1 pt-2 text-[11px]">
          <span className="font-semibold">{label}</span>
          <span className="text-white/45">{date}</span>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}

function ScrollCue() {
  return (
    <motion.a
      href="#mission"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8 }}
      className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[11px] font-medium uppercase tracking-[0.25em] text-white/45 transition hover:text-white md:flex"
      aria-label="Scroll to mission and vision"
    >
      <span className="relative flex h-10 w-6 justify-center rounded-full border border-white/25">
        <motion.span
          className="mt-2 h-2 w-1 rounded-full bg-white/70"
          animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      Scroll
    </motion.a>
  );
}
