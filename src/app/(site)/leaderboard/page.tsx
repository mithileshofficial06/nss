import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { getBatches } from "@/lib/data";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardIndex() {
  const batches = await getBatches();
  const currentYear = new Date().getFullYear();
  return (
    <>
      <PageHeader eyebrow="Leaderboard" title="Pick your batch.">
        Points are awarded for every event you volunteer at. Standings are maintained by the NSS admin team.
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b, i) => {
          const year = Math.min(4, Math.max(1, currentYear - b.start_year + (new Date().getMonth() >= 6 ? 1 : 0)));
          const graduated = currentYear > b.end_year || (currentYear === b.end_year && new Date().getMonth() >= 6);
          return (
            <Reveal key={b.id} delay={i * 0.07}>
              <TiltCard className="rounded-[2rem]">
                <Link
                  href={`/leaderboard/${b.label}`}
                  data-cursor="Rank"
                  className="group relative block overflow-hidden rounded-[2rem] bg-navy-900 p-8 text-white"
                >
                  <Trophy className="absolute -right-6 -top-6 h-40 w-40 text-white/[0.06] transition duration-700 group-hover:rotate-12 group-hover:text-accent/20" />
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">Batch</p>
                  <p className="mt-2 font-display text-7xl font-extrabold tracking-tighter">{b.label}</p>
                  <p className="mt-4 text-sm text-white/60">
                    {b.start_year} – {b.end_year} · {graduated ? "Alumni" : `Year ${year}`}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition group-hover:bg-accent group-hover:text-ink">
                    View standings <ArrowRight size={16} />
                  </span>
                </Link>
              </TiltCard>
            </Reveal>
          );
        })}
      </section>
    </>
  );
}
