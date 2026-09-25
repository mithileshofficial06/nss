"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PersonCard } from "@/components/site/person-card";
import { SectionTitle } from "./section-title";
import type { OfficeBearer } from "@/lib/types";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Landing "Team" section: every current member's portrait, office bearers first, then the media team. */
export function OfficeBearers({ people, batchLabels }: { people: OfficeBearer[]; batchLabels: Record<string, string> }) {
  if (!people.length) return null;
  const tenure = people[0].tenure;
  const bearers = people.filter((p) => p.team === "Office Bearers");
  const media = people.filter((p) => p.team !== "Office Bearers");
  const batchOf = (p: OfficeBearer) => (p.batch_id ? batchLabels[p.batch_id] : undefined);

  return (
    <section id="team" className="bg-white px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32">
      <div className="mx-auto max-w-[1440px]">
        <SectionTitle index="04" title="Team" caption="Office bearers & media team" />
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.03em] text-ink">
            <MaskLine delay={0.1}>
              The people behind it, <em className="text-nss-red">{tenure}.</em>
            </MaskLine>
          </h2>
          <Link href="/team" className="group font-display text-[17px] font-medium text-ink transition-colors hover:text-nss-red">
            Every tenure &amp; batch <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <Group title="Office bearers" count={bearers.length} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {bearers.map((p, i) => (
            <Portrait key={p.id} index={i} columns={5}>
              <PersonCard person={p} batch={batchOf(p)} />
            </Portrait>
          ))}
        </Group>

        {media.length > 0 && (
          <Group title="Media team" count={media.length} className="grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
            {media.map((p, i) => (
              <Portrait key={p.id} index={i} columns={6}>
                <PersonCard person={p} batch={batchOf(p)} size="sm" />
              </Portrait>
            ))}
          </Group>
        )}
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

function Group({ title, count, className, children }: { title: string; count: number; className: string; children: React.ReactNode }) {
  return (
    <div className="mt-16">
      <p className="flex justify-between border-b border-ink pb-2 font-display text-[15px] font-medium text-ink">
        <span>{title}</span>
        <span className="text-ink/45">{String(count).padStart(2, "0")}</span>
      </p>
      <div className={cn("mt-8 grid gap-x-5 gap-y-10", className)}>{children}</div>
    </div>
  );
}

/**
 * Upward wipe + rise, staggered along each row. The wrapper observes visibility and drives the
 * clipped child through variants, since a fully clipped element never reports itself as in view.
 */
function Portrait({ index, columns, children }: { index: number; columns: number; children: React.ReactNode }) {
  const delay = (index % columns) * 0.08;
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
      <motion.div
        variants={{
          hidden: { clipPath: "inset(100% 0% 0% 0%)", y: 40 },
          show: { clipPath: "inset(0% 0% 0% 0%)", y: 0, transition: { duration: 1, delay, ease } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
