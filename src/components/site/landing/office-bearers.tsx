"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { SectionLabel } from "./section-label";
import type { OfficeBearer } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function OfficeBearers({ people, batchLabels }: { people: OfficeBearer[]; batchLabels: Record<string, string> }) {
  if (!people.length) return null;
  const tenure = people[0].tenure;
  const groups = [
    { name: "Office bearers", members: people.filter((p) => p.team === "Office Bearers") },
    { name: "Media team", members: people.filter((p) => p.team !== "Office Bearers") },
  ].filter((g) => g.members.length);

  return (
    <section id="office-bearers" className="bg-white pb-24 pt-24 sm:pb-32 sm:pt-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <SectionLabel index="03" label="Current office bearers" />
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.03em] text-ink">
            <MaskLine>The people</MaskLine>
            <MaskLine delay={0.1}>
              behind it, <em className="text-nss-red">{tenure}.</em>
            </MaskLine>
          </h2>
          <Link href="/team" className="group font-display text-[17px] font-medium text-ink transition-colors hover:text-nss-red">
            Every tenure &amp; batch <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      <NameBand people={people} />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <IndexTable groups={groups} batchLabels={batchLabels} />
      </div>
    </section>
  );
}

function MaskLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.span initial="hidden" whileInView="show" viewport={{ once: true }} className="block overflow-hidden pb-[0.08em]">
      <motion.span className="block" variants={{ hidden: { y: "105%" }, show: { y: "0%", transition: { duration: 1, delay, ease } } }}>
        {children}
      </motion.span>
    </motion.span>
  );
}

function Portrait({ person, className }: { person: OfficeBearer; className?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-white font-serif italic text-navy-600", className)}>
      {person.photo_url ? <Image src={person.photo_url} alt="" fill sizes="160px" className="object-cover" /> : initials(person.name)}
    </span>
  );
}

/** NSS-blue band of circular portraits and italic names, two rows drifting in opposite directions. */
function NameBand({ people }: { people: OfficeBearer[] }) {
  const half = Math.ceil(people.length / 2);
  const rows = [people.slice(0, half), people.slice(half)];
  return (
    // The wrapper observes visibility; the band itself starts fully clipped
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="mt-12" aria-hidden>
      <motion.div
        variants={{ hidden: { clipPath: "inset(0% 0% 100% 0%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.1, ease } } }}
        className="overflow-hidden bg-navy-600 py-8 text-white"
      >
        <div className="space-y-5">
          {rows.map((row, r) => (
            <div key={r} className={cn("flex w-max gap-10 hover:[animation-play-state:paused]", r === 0 ? "animate-marquee" : "animate-marquee-rev")}>
              {[...row, ...row, ...row, ...row].map((p, i) => (
                <span key={`${p.id}-${i}`} className="flex items-center gap-4">
                  <Portrait person={p} className="h-16 w-16 text-2xl ring-2 ring-white/30 sm:h-20 sm:w-20 sm:text-3xl" />
                  <span className="whitespace-nowrap font-serif text-[clamp(2.2rem,4.5vw,4rem)] italic leading-none">{p.name.split(" ")[0]}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Index table; hovering a row reveals that person's portrait following the cursor. */
function IndexTable({ groups, batchLabels }: { groups: { name: string; members: OfficeBearer[] }[]; batchLabels: Record<string, string> }) {
  const [hovered, setHovered] = useState<OfficeBearer | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 30 });
  const y = useSpring(my, { stiffness: 300, damping: 30 });
  // Running number across groups
  const numbered = groups.map((g, gi) => ({
    ...g,
    start: groups.slice(0, gi).reduce((sum, prev) => sum + prev.members.length, 0),
  }));

  return (
    <div
      className="relative mt-16"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <div className="hidden grid-cols-[4rem_2fr_1.6fr_1fr_1fr] border-b border-ink pb-2 font-display text-[14px] font-medium text-ink/45 md:grid">
        <span>No.</span>
        <span>Name</span>
        <span>Position</span>
        <span>Year &amp; dept</span>
        <span className="text-right">Batch</span>
      </div>

      {numbered.map((g) => (
        <div key={g.name}>
          <p className="border-b border-ink/15 pb-2 pt-8 font-display text-[14px] font-medium text-ink/45">{g.name}</p>
          <ul>
            {g.members.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.6, ease }}
                onPointerEnter={() => setHovered(p)}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 border-b border-ink/15 py-4 transition-colors hover:text-nss-red md:grid-cols-[4rem_2fr_1.6fr_1fr_1fr] md:gap-x-0"
              >
                <span className="font-display text-[14px] font-medium text-ink/40 tabular-nums group-hover:text-nss-red">{String(g.start + i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-none tracking-[-0.01em]">{p.name}</span>
                <span className="font-display text-[16px] font-medium md:text-[17px]">{p.position}</span>
                <span className="col-start-2 font-display text-[15px] text-ink/55 group-hover:text-nss-red/80 md:col-start-auto">{p.department}</span>
                <span className="hidden text-right font-display text-[15px] text-ink/55 tabular-nums group-hover:text-nss-red/80 md:block">
                  {p.batch_id ? batchLabels[p.batch_id] : "—"}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      ))}

      {/* Floating portrait preview (pointer devices only) */}
      <motion.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block">
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered.id}
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease }}
              className="absolute -translate-y-1/2 translate-x-6"
            >
              <div className="relative grid h-44 w-36 place-items-center overflow-hidden bg-navy-600 shadow-2xl">
                {hovered.photo_url ? (
                  <Image src={hovered.photo_url} alt="" fill sizes="144px" className="object-cover" />
                ) : (
                  <>
                    <Image src="/brand/nss-logo.png" alt="" width={160} height={160} className="absolute -bottom-8 -right-8 w-32 opacity-15" />
                    <span className="font-serif text-6xl italic text-white">{initials(hovered.name)}</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
