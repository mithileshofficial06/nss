import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
        {isSupabaseConfigured ? "Ranked by points earned at NSS events." : <span className="text-nss-red">Preview data — connect Supabase for live standings.</span>}
      </PageHeader>
      <section className="mx-auto max-w-[1440px] px-5 pb-24 sm:px-8">
        <div className="mb-10 flex flex-wrap gap-x-6 gap-y-1 font-display text-[16px] font-medium">
          {batches.map((b) => (
            <Link
              key={b.id}
              href={`/leaderboard/${b.label}`}
              className={cn("transition-colors", b.id === batch.id ? "text-nss-red" : "text-ink/45 hover:text-ink")}
            >
              {b.label}
            </Link>
          ))}
        </div>
        {hidden ? (
          <div className="border-y border-ink py-20 text-center">
            <p className="font-serif text-4xl text-ink">Standings are hidden right now.</p>
            <p className="mt-2 font-display text-[16px] text-ink/55">The NSS team will publish the leaderboard soon.</p>
          </div>
        ) : (
          <LeaderboardView rows={rows} highlightId={profile?.id} />
        )}
      </section>
    </>
  );
}
