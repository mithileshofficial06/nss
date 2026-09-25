import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { LeaderboardView } from "@/components/site/leaderboard-view";
import { getBatches, getCurrentProfile, getLeaderboard, getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/leaderboard/[batch]">): Promise<Metadata> {
  const { batch } = await params;
  return { title: `Batch ${batch} leaderboard` };
}

export default async function BatchLeaderboard({ params }: PageProps<"/leaderboard/[batch]">) {
  const { batch: label } = await params;
  const [batches, settings, profile] = await Promise.all([getBatches(), getSettings(), getCurrentProfile()]);
  const batch = batches.find((b) => b.label === label);
  if (!batch) notFound();
  const hidden = !settings.leaderboard_public && profile?.role !== "admin";
  const rows = hidden ? [] : await getLeaderboard(batch.id);

  return (
    <>
      <PageHeader eyebrow="Leaderboard" title={`Batch ${batch.label}`}>
        {!isSupabaseConfigured && <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">Preview data — connect Supabase for live standings</span>}
      </PageHeader>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {batches.map((b) => (
            <Link
              key={b.id}
              href={`/leaderboard/${b.label}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-bold transition",
                b.id === batch.id ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/15 text-navy-900/70 hover:border-navy-900/40",
              )}
            >
              {b.label}
            </Link>
          ))}
        </div>
        {hidden ? (
          <div className="rounded-3xl border border-dashed border-navy-900/20 p-14 text-center">
            <Lock className="mx-auto text-navy-900/40" />
            <p className="mt-3 font-bold text-navy-900">Standings are hidden right now.</p>
            <p className="text-sm text-navy-900/55">The NSS team will publish the leaderboard soon.</p>
          </div>
        ) : (
          <LeaderboardView rows={rows} highlightId={profile?.id} />
        )}
      </section>
    </>
  );
}
