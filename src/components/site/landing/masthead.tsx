"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "@/components/site/navbar";
import { useIntroReady } from "@/components/site/intro";
import { LiveDate, LiveTime } from "@/components/ui/live-clock";
import { CountUp } from "@/components/ui/motion";

const ease = [0.22, 1, 0.36, 1] as const;

type NextEvent = { title: string; slug: string; date: string } | null;
type Stats = { volunteers: number; events: number; hours: number; batches: number };

// Lead photographs that cross-fade in the hero's centre frame
const LEAD = [
  { src: "/images/orientation/orientation-1.webp", caption: "Orientation Day, 2026" },
  { src: "/images/events/beach-cleanup-2025.webp", caption: "Beach Clean-Up, 2025" },
  { src: "/images/events/blood-donation-2026.webp", caption: "Blood Donation Camp, 2026" },
  { src: "/images/events/road-safety-rally-2026.webp", caption: "Road Safety Rally, 2026" },
];

/** Fades and lifts into place `delay` seconds after the intro curtain clears. */
const rise = (delay: number, y = 12): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease } },
});

/**
 * Landing hero: government-scheme strip, the NSS LICET wordmark flanked by the NSS emblem and
 * the LICET crest, ruled nav, then a three-column lead band (about, photo, figures).
 * Everything waits for the intro curtain before animating.
 */
export function Masthead({ nextEvent, signedIn, stats }: { nextEvent: NextEvent; signedIn: { href: string; label: string } | null; stats: Stats }) {
  const ready = useIntroReady();
  return (
    <motion.header initial="hidden" animate={ready ? "show" : "hidden"} className="bg-white px-5 pt-5 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Scheme strip */}
        <motion.div
          variants={rise(0, -8)}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 font-display text-[12px] font-medium uppercase tracking-[0.08em] text-ink/55 sm:text-[13px]"
        >
          <span>
            <span className="hidden sm:inline">National Service Scheme · </span>Est. 1969
          </span>
          <span className="flex w-16 overflow-hidden sm:w-24">
            <span className="h-[3px] flex-1 bg-navy-600" />
            <span className="h-[3px] flex-1 bg-white" />
            <span className="h-[3px] flex-1 bg-nss-red" />
          </span>
          <span className="text-right">
            <span className="hidden sm:inline">Ministry of Youth Affairs &amp; Sports · </span>Govt. of India
          </span>
        </motion.div>

        <Wordmark />

        <motion.p variants={rise(0.75)} className="mt-4 text-center font-display text-[clamp(0.95rem,1.4vw,1.2rem)] font-semibold uppercase tracking-[0.22em] text-navy-600">
          <span lang="hi" className="tracking-normal">राष्ट्रीय सेवा योजना</span>
          <span className="mx-3 text-nss-red">·</span>
          Not me, <span className="text-nss-red">but you</span>
        </motion.p>

        {/* Dateline */}
        <motion.div variants={rise(0.9, 0)} className="mt-8 grid grid-cols-1 items-center gap-2 font-display text-[14px] text-ink/70 sm:grid-cols-3">
          <span>Loyola-ICAM College of Engineering &amp; Technology</span>
          <span className="hidden sm:block sm:text-center">Chennai, Tamil Nadu</span>
          <span className="tabular-nums sm:text-right">
            <LiveTime /> &nbsp;<LiveDate />
          </span>
        </motion.div>

        {/* Ruled nav */}
        <nav aria-label="Primary" className="relative mt-3">
          <Rule delay={0.9} />
          <ul className="flex items-center justify-start gap-x-8 overflow-x-auto py-3 font-serif text-[22px] text-ink sm:justify-center [scrollbar-width:none]">
            {NAV_LINKS.map((l, i) => (
              <motion.li key={l.href} variants={rise(1 + i * 0.05, 8)}>
                <Link href={l.href} className="whitespace-nowrap transition-colors hover:text-nss-red">
                  {l.label}
                </Link>
              </motion.li>
            ))}
            <motion.li variants={rise(1.3, 0)} className="text-ink/20">
              |
            </motion.li>
            <motion.li variants={rise(1.35, 8)}>
              <Link href={signedIn?.href ?? "/register"} className="whitespace-nowrap italic text-nss-red transition-colors hover:text-navy-600">
                {signedIn?.label ?? "Join NSS"}
              </Link>
            </motion.li>
          </ul>
          <Rule delay={1} />
        </nav>

        <LeadBand nextEvent={nextEvent} signedIn={signedIn} stats={stats} ready={ready} />
      </div>
    </motion.header>
  );
}

/** "NSS LICET" in the emblem's own style — heavy condensed caps, NSS blue and red — between the two marks. */
function Wordmark() {
  const words = [
    { text: "NSS", color: "text-navy-600", hover: "hover:text-nss-red" },
    { text: "LICET", color: "text-nss-red", hover: "hover:text-navy-600" },
  ];
  return (
    <h1
      aria-label="NSS LICET"
      className="mx-auto mt-8 flex w-fit items-center justify-center gap-[0.12em] font-poster text-[clamp(3.25rem,13.5vw,15rem)] uppercase leading-[0.9] sm:mt-10"
    >
      <motion.span
        variants={{ hidden: { rotate: -180, scale: 0, opacity: 0 }, show: { rotate: 0, scale: 1, opacity: 1, transition: { duration: 1.2, delay: 0.25, ease } } }}
        className="block w-[0.82em] shrink-0"
      >
        <Image src="/brand/nss-logo.png" alt="" width={260} height={260} priority className="h-auto w-full" />
      </motion.span>

      <span aria-hidden className="flex gap-[0.22em]">
        {words.map((w, wi) => (
          <span key={w.text} className="flex overflow-hidden py-[0.04em]">
            {w.text.split("").map((ch, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1, delay: 0.05 + (wi * 3 + i) * 0.05, ease } } }}
                className={`inline-block transition-colors duration-300 ${w.color} ${w.hover}`}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </span>

      <motion.span
        variants={{ hidden: { rotate: 180, scale: 0, opacity: 0 }, show: { rotate: 0, scale: 1, opacity: 1, transition: { duration: 1.2, delay: 0.4, ease } } }}
        className="block w-[0.82em] shrink-0"
      >
        <Image src="/brand/licet-logo.png" alt="" width={105} height={105} priority className="h-auto w-full" />
      </motion.span>
    </h1>
  );
}

/** About · lead photograph · figures, under the nav rule. */
function LeadBand({ nextEvent, signedIn, stats, ready }: { nextEvent: NextEvent; signedIn: { href: string; label: string } | null; stats: Stats; ready: boolean }) {
  const figures = [
    { label: "Volunteers", value: stats.volunteers, suffix: "+" },
    { label: "Events held", value: stats.events, suffix: "" },
    { label: "Service hours", value: stats.hours, suffix: "+" },
    { label: "Batches", value: stats.batches, suffix: "" },
  ];
  return (
    <div className="grid gap-10 py-10 lg:grid-cols-[1fr_1.5fr_1fr] lg:gap-0 lg:py-12">
      {/* About */}
      <motion.div variants={rise(1.15)} className="flex flex-col lg:border-r lg:border-ink/15 lg:pr-8">
        <p className="font-display text-[13px] font-medium uppercase tracking-[0.08em] text-nss-red">The unit</p>
        <p className="mt-3 font-serif text-[clamp(1.6rem,2.2vw,2.15rem)] leading-[1.1] text-ink">
          Engineers in training, learning that the problems worth solving are <em className="text-navy-600">human ones.</em>
        </p>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/65">
          Since 1969, the National Service Scheme has asked students to learn through service. At LICET that means beach clean-ups, blood-donation
          camps, road-safety rallies and outreach in the communities around Chennai — with every hour logged to your batch.
        </p>
        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-8 font-display text-[16px] font-semibold">
          <Link href={signedIn?.href ?? "/register"} className="group inline-flex items-center gap-1.5 border-b-2 border-nss-red pb-0.5 text-nss-red">
            {signedIn ? `Open ${signedIn.label.toLowerCase()}` : "Become a volunteer"}
            <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/events" className="group inline-flex items-center gap-1.5 border-b-2 border-ink pb-0.5 text-ink transition-colors hover:border-navy-600 hover:text-navy-600">
            See events
            <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>

      {/* Lead photo */}
      <motion.div
        variants={{ hidden: { clipPath: "inset(100% 0 0 0)" }, show: { clipPath: "inset(0% 0 0 0)", transition: { duration: 1.2, delay: 1.05, ease } } }}
        className="lg:px-8"
      >
        <LeadPhoto />
      </motion.div>

      {/* Figures + next event */}
      <motion.div variants={rise(1.3)} className="flex flex-col lg:border-l lg:border-ink/15 lg:pl-8">
        <p className="font-display text-[13px] font-medium uppercase tracking-[0.08em] text-nss-red">By the numbers</p>
        <dl className="mt-3 grid grid-cols-2 border-t border-ink/15">
          {figures.map((f, i) => (
            <div key={f.label} className={`border-b border-ink/15 py-4 ${i % 2 === 0 ? "border-r pr-4" : "pl-4"}`}>
              <dt className="font-display text-[13px] text-ink/55">{f.label}</dt>
              <dd className="mt-1 font-poster text-[clamp(2rem,3vw,2.8rem)] leading-none text-navy-600">
                <CountUp to={f.value} suffix={f.suffix} start={ready} />
              </dd>
            </div>
          ))}
        </dl>

        {nextEvent ? (
          <Link href={`/events/${nextEvent.slug}`} className="group mt-auto block bg-navy-600 p-5 text-white transition-colors hover:bg-nss-red">
            <span className="font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-white/70">Next up · {nextEvent.date}</span>
            <span className="mt-2 flex items-start justify-between gap-3 font-serif text-[26px] leading-[1.1]">
              {nextEvent.title}
              <ArrowUpRight size={22} className="mt-1 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ) : (
          <Link href="/events" className="group mt-auto block border border-ink/15 p-5 transition-colors hover:border-navy-600">
            <span className="font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-ink/50">Next up</span>
            <span className="mt-2 block font-serif text-[24px] leading-[1.1] text-ink">New drives are announced here first.</span>
          </Link>
        )}
      </motion.div>
    </div>
  );
}

function LeadPhoto() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LEAD.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        <AnimatePresence initial={false}>
          <motion.div
            key={LEAD[i].src}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease }}
            className="absolute inset-0"
          >
            <Image src={LEAD[i].src} alt={LEAD[i].caption} fill priority={i === 0} sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      <figcaption className="mt-2 flex items-center justify-between font-display text-[13px] text-ink/60">
        <span>{LEAD[i].caption}</span>
        <span className="flex gap-1.5" aria-hidden>
          {LEAD.map((_, n) => (
            <span key={n} className={`h-[3px] w-5 transition-colors duration-500 ${n === i ? "bg-nss-red" : "bg-ink/15"}`} />
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

function Rule({ delay }: { delay: number }) {
  return <motion.div variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, delay, ease } } }} className="h-px origin-left bg-ink/80" />;
}
