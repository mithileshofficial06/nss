"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { AlertTriangle, Flag, HandHeart, Handshake, Lightbulb, Megaphone, Scale, Search, UserRound, UsersRound, type LucideIcon } from "lucide-react";
import { SectionLabel } from "./section-label";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

// The ten objectives of the National Service Scheme
const objectives: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Know the community", text: "Understand the community in which they work.", icon: Search },
  { title: "Know yourself", text: "Understand themselves in relation to their community.", icon: UserRound },
  { title: "Solve together", text: "Identify the needs and problems of the community and involve them in problem-solving.", icon: Handshake },
  { title: "Civic responsibility", text: "Develop among themselves a sense of social and civic responsibility.", icon: Scale },
  { title: "Practical solutions", text: "Use their knowledge to find practical solutions to individual and community problems.", icon: Lightbulb },
  { title: "Group living", text: "Develop the competence required for group living and sharing responsibilities.", icon: UsersRound },
  { title: "Mobilise people", text: "Gain skills in mobilising community participation.", icon: Megaphone },
  { title: "Lead democratically", text: "Acquire leadership qualities and a democratic attitude.", icon: Flag },
  { title: "Rise in a crisis", text: "Develop the capacity to meet emergencies and natural disasters.", icon: AlertTriangle },
  { title: "One nation", text: "Practise national integration and social harmony.", icon: HandHeart },
];

export function Objectives() {
  return (
    <section id="objectives" className="relative bg-navy-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-navy-600/35 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-nss-red/15 blur-[140px]" />
      </div>
      <PinnedTrack />
      <StackedList />
    </section>
  );
}

function Header({ counter }: { counter?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <SectionLabel index="02" label="Objectives" tone="light" />
        <h2 className="mt-6 max-w-2xl font-display text-[clamp(2.25rem,4.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          Ten objectives that guide <span className="font-serif font-normal italic text-accent">every volunteer.</span>
        </h2>
      </div>
      {counter}
    </div>
  );
}

/** Desktop: the section pins while cards travel horizontally with scroll. */
function PinnedTrack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  // Slide the track by (its own width − viewport), so the last card lands at the right edge
  const x = useTransform(progress, (v) => `calc(${-v} * (100% - 100vw))`);
  const current = useTransform(progress, (v) => String(Math.min(objectives.length, Math.floor(v * objectives.length) + 1)).padStart(2, "0"));

  return (
    <div ref={ref} className="relative hidden h-[420vh] lg:block">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-8">
          <Header
            counter={
              <div className="flex items-center gap-5">
                <p className="font-display text-sm font-semibold tabular-nums text-white/60">
                  <motion.span className="text-2xl text-white">{current}</motion.span> / {objectives.length}
                </p>
                <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full origin-left bg-gradient-to-r from-nss-red to-accent" style={{ scaleX: progress }} />
                </div>
              </div>
            }
          />
        </div>
        <motion.ol style={{ x }} className="mt-14 flex w-max gap-6 px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {objectives.map((o, i) => (
            <li key={o.title} className="w-[380px] shrink-0">
              <ObjectiveCard index={i} {...o} />
            </li>
          ))}
        </motion.ol>
      </div>
    </div>
  );
}

/** Mobile / tablet: a simple staggered grid. */
function StackedList() {
  return (
    <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:hidden">
      <Header />
      <ol className="mt-12 grid gap-4 sm:grid-cols-2">
        {objectives.map((o, i) => (
          <motion.li
            key={o.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: (i % 2) * 0.08, ease }}
          >
            <ObjectiveCard index={i} {...o} />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function ObjectiveCard({ index, title, text, icon: Icon }: { index: number; title: string; text: string; icon: LucideIcon }) {
  const red = index % 3 === 0;
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.07]"
    >
      <div
        aria-hidden
        className={cn(
          "absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100",
          red ? "bg-nss-red/40" : "bg-navy-400/40",
        )}
      />
      <div className="relative flex items-start justify-between">
        <span className={cn("grid h-12 w-12 place-items-center rounded-2xl ring-1", red ? "bg-nss-red/15 text-ember ring-nss-red/30" : "bg-navy-600/40 text-accent ring-white/10")}>
          <Icon size={22} />
        </span>
        <span className="font-display text-6xl font-bold leading-none tracking-tighter text-white/[0.08] transition-colors duration-500 group-hover:text-white/15">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="relative mt-auto pt-10 font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="relative mt-3 text-[15px] leading-relaxed text-white/60">{text}</p>
    </motion.article>
  );
}
