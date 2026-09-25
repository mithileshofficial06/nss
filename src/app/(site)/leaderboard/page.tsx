import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/motion";
import { getBatches } from "@/lib/data";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardIndex() {
  const batches = await getBatches();
  const now = new Date();
  // Academic years roll over in July
  const academicYear = now.getFullYear() - (now.getMonth() < 6 ? 1 : 0);

  return (
    <>
      <PageHeader eyebrow="Leaderboard" title="Pick your batch.">
        Points are awarded for every event you volunteer at. Standings are maintained by the NSS team.
      </PageHeader>
      <section className="bg-white px-5 pb-24 sm:px-8">
        <ol className="mx-auto max-w-[1440px] border-t border-ink">
          {batches.map((b, i) => {
            const year = academicYear - b.start_year + 1;
            const status = year > 4 ? "Alumni" : year < 1 ? "Incoming" : `Year ${year}`;
            return (
              <Reveal key={b.id} delay={i * 0.05} y={16}>
                <li>
                  <Link
                    href={`/leaderboard/${b.label}`}
                    data-cursor="Rank"
                    className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-ink/15 py-6 transition-colors hover:text-nss-red sm:grid-cols-[4rem_1fr_12rem_auto]"
                  >
                    <span className="font-display text-[14px] font-medium text-ink/40 group-hover:text-nss-red">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.85] tracking-[-0.03em]">Batch {b.label}</span>
                    <span className="hidden font-display text-[16px] font-medium text-ink/55 group-hover:text-nss-red sm:block">
                      {b.start_year} – {b.end_year} · {status}
                    </span>
                    <span className="font-display text-2xl transition-transform duration-300 group-hover:translate-x-2">→</span>
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </section>
    </>
  );
}
