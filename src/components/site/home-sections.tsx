"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Droplets, HandHeart, Leaf, Megaphone, Trophy } from "lucide-react";
import { CountUp, Reveal } from "@/components/ui/motion";
import type { Batch, GalleryItem, OfficeBearer } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export function Stats({ stats }: { stats: { volunteers: number; events: number; hours: number; batches: number } }) {
  const items = [
    { label: "Volunteers", value: stats.volunteers, suffix: "+" },
    { label: "Events conducted", value: stats.events, suffix: "" },
    { label: "Service hours", value: stats.hours, suffix: "+" },
    { label: "Batches", value: stats.batches, suffix: "" },
  ];
  return (
    <section id="stats" className="relative border-b border-navy-900/10 bg-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="border-navy-900/10 px-6 py-12 text-center odd:border-r lg:border-r lg:last:border-r-0">
            <CountUp to={s.value} suffix={s.suffix} className="font-display text-5xl font-extrabold tracking-tight text-navy-900 sm:text-6xl" />
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-900/50">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Ticker() {
  const words = ["Serve", "Lead", "Inspire", "Clean-ups", "Blood drives", "Outreach", "Rallies", "Awareness", "Not me but you"];
  const row = [...words, ...words];
  return (
    <div className="relative -rotate-2 overflow-hidden bg-nss-red py-5 text-white shadow-2xl">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            {w}
            <span className="text-saffron">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const pillars = [
  { icon: Leaf, title: "Environment", text: "Beach and campus clean-ups, waste-segregation drives and tree planting across Chennai.", img: "/images/events/beach-cleanup-2025.webp", color: "bg-emerald-500" },
  { icon: Droplets, title: "Health", text: "Blood donation camps, fitness campaigns and mental-health awareness on campus.", img: "/images/events/blood-donation-2026.webp", color: "bg-nss-red" },
  { icon: Megaphone, title: "Awareness", text: "Road-safety rallies, drug-free marathons, vigilance quizzes and street plays.", img: "/images/events/road-safety-rally-2026.webp", color: "bg-saffron" },
  { icon: HandHeart, title: "Outreach", text: "Blanket donations, orphanage and old-age home visits — service with a human face.", img: "/images/events/blanket-donation-2025.webp", color: "bg-navy-600" },
];

export function Pillars() {
  const [active, setActive] = useState(0);
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-nss-red">What we do</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-navy-900 sm:text-6xl">Four ways we show up.</h2>
      </Reveal>
      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <ul className="space-y-3">
          {pillars.map((p, i) => (
            <li key={p.title}>
              <button
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex w-full items-start gap-5 rounded-3xl border p-6 text-left transition-all duration-500",
                  active === i ? "border-navy-900 bg-navy-900 text-white shadow-2xl shadow-navy-900/30" : "border-navy-900/10 bg-white hover:border-navy-900/30",
                )}
              >
                <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white", p.color)}>
                  <p.icon size={22} />
                </span>
                <span>
                  <span className="flex items-center gap-3 font-display text-2xl font-bold">
                    {p.title}
                    <ArrowRight size={18} className={cn("transition-all", active === i ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0")} />
                  </span>
                  <span className={cn("mt-1 block text-sm leading-relaxed", active === i ? "text-white/70" : "text-navy-900/60")}>{p.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-navy-900">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={active}
              initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.15 }}
              animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image src={pillars[active].img} alt={pillars[active].title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <p className="absolute bottom-6 left-6 font-display text-6xl font-extrabold uppercase tracking-tight text-white/90 sm:text-7xl">{pillars[active].title}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function PhotoMarquee({ items }: { items: GalleryItem[] }) {
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)];
  return (
    <section className="overflow-hidden bg-ink py-24 text-white">
      <Reveal className="mx-auto mb-12 flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-saffron">Moments</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">Captured in the field.</h2>
        </div>
        <Link href="/gallery" className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white hover:text-ink">
          Open gallery <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      </Reveal>
      <div className="mask-fade-x space-y-5">
        {rows.map((row, r) => (
          <div key={r} className={cn("flex w-max gap-5 hover:[animation-play-state:paused]", r === 0 ? "animate-marquee" : "animate-marquee-rev")}>
            {[...row, ...row].map((g, i) => (
              <div key={`${g.id}-${i}`} className="group relative h-56 w-80 shrink-0 overflow-hidden rounded-2xl sm:h-64 sm:w-96" data-cursor="Look">
                <Image src={g.image_url} alt={g.caption ?? ""} fill sizes="384px" className="object-cover grayscale-[40%] transition duration-700 group-hover:scale-110 group-hover:grayscale-0" />
                <span className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  {g.caption}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function BatchTeaser({ batches }: { batches: Batch[] }) {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-28 text-white">
      <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-saffron/20 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <Reveal>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-saffron text-ink">
            <Trophy />
          </span>
          <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">Batch-wise leaderboard.</h2>
          <p className="mt-4 max-w-md text-white/65">
            Every event you volunteer for earns points. See how your batch stacks up — standings are updated by the NSS team after each event.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {batches.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.07}>
              <Link
                href={`/leaderboard/${b.label}`}
                data-cursor="Rank"
                className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-saffron/60 hover:bg-white/10"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Batch</p>
                <p className="mt-2 font-display text-4xl font-extrabold tracking-tight">{b.label}</p>
                <ArrowRight className="absolute bottom-5 right-5 -rotate-45 text-saffron opacity-0 transition group-hover:rotate-0 group-hover:opacity-100" size={20} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamPreview({ people }: { people: OfficeBearer[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-nss-red">Office bearers {people[0]?.tenure}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-navy-900 sm:text-6xl">The people behind it.</h2>
        </div>
        <Link href="/team" className="group inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-bold text-white">
          Meet the team <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {people.slice(0, 5).map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06}>
            <PersonCard person={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function PersonCard({ person }: { person: OfficeBearer }) {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-navy-900">
      {person.photo_url ? (
        <Image src={person.photo_url} alt={person.name} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--color-navy-600),var(--color-navy-950))]">
          <span className="font-display text-6xl font-extrabold text-white/90 transition duration-500 group-hover:scale-110">{initials(person.name)}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-saffron">{person.position}</p>
        <p className="mt-1 font-display text-lg font-bold leading-tight">{person.name}</p>
        <p className="text-xs text-white/60">{person.department}</p>
      </div>
    </div>
  );
}
