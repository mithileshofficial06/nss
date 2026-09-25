import type { Metadata } from "next";
import Link from "next/link";
import { awardPoints, deleteLedgerEntry, importPointsCsv } from "../../actions";
import { AwardForm, CsvImport } from "./points-forms";
import { Card, ConfirmButton, PageTitle } from "@/components/admin/ui";
import { getBatches, getLeaderboard } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Leaderboard & points" };

export default async function PointsPage({ searchParams }: PageProps<"/admin/points">) {
  const sp = await searchParams;
  const batches = await getBatches();
  const batch = batches.find((b) => b.label === sp.batch) ?? batches.find((b) => b.label === "24-28") ?? batches[0];
  if (!batch) return <PageTitle title="Leaderboard & points" description="Add a batch in Settings first." />;

  const supabase = await createClient();
  const [board, { data: students }, { data: events }] = await Promise.all([
    getLeaderboard(batch.id),
    supabase.from("profiles").select("id, full_name, register_no").eq("batch_id", batch.id).eq("role", "student").order("full_name"),
    supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false }).limit(40),
  ]);
  const ids = (students ?? []).map((s) => s.id);
  const { data: ledger } = ids.length
    ? await supabase.from("points_ledger").select("id, points, reason, created_at, student_id").in("student_id", ids).order("created_at", { ascending: false }).limit(30)
    : { data: [] };
  const nameOf = new Map((students ?? []).map((s) => [s.id, s.full_name]));

  return (
    <>
      <PageTitle title="Leaderboard & points" description="Standings are the sum of each student's points entries.">
        <div className="flex flex-wrap gap-2">
          {batches.map((b) => (
            <Link
              key={b.id}
              href={`/admin/points?batch=${b.label}`}
              className={cn("rounded-full border px-4 py-2 text-sm font-bold", b.id === batch.id ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/15 bg-white text-navy-900/70")}
            >
              {b.label}
            </Link>
          ))}
        </div>
      </PageTitle>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card title={`Batch ${batch.label} standings`} description={`${board.length} students`}>
          <ol className="divide-y divide-navy-900/5">
            {board.map((r) => (
              <li key={r.student_id} className="flex items-center gap-4 py-2.5 text-sm">
                <span className={cn("grid h-8 w-8 place-items-center rounded-full font-display text-xs font-extrabold", r.rank <= 3 ? "bg-accent text-ink" : "bg-navy-100 text-navy-900")}>{r.rank}</span>
                <span className="flex-1">
                  <span className="font-bold text-navy-900">{r.full_name}</span>
                  <span className="ml-2 text-xs text-navy-900/45">
                    {r.department} · {r.events_attended} events
                  </span>
                </span>
                <span className="font-display text-lg font-extrabold text-navy-900">{r.points}</span>
              </li>
            ))}
            {!board.length && <li className="py-10 text-center text-sm text-navy-900/50">No students registered in this batch yet.</li>}
          </ol>
        </Card>

        <div className="space-y-6">
          <Card title="Award / deduct points">
            <AwardForm action={awardPoints} students={students ?? []} events={events ?? []} />
          </Card>
          <Card title="Bulk import (CSV)" description="register_no,points,reason — one per line">
            <CsvImport action={importPointsCsv} />
          </Card>
        </div>
      </div>

      <Card className="mt-6" title="Recent points entries">
        <ul className="divide-y divide-navy-900/5">
          {(ledger ?? []).map((l) => (
            <li key={l.id} className="flex items-center gap-4 py-2.5 text-sm">
              <span className={cn("w-14 text-right font-display font-extrabold", l.points >= 0 ? "text-emerald-600" : "text-nss-red")}>
                {l.points > 0 ? "+" : ""}
                {l.points}
              </span>
              <span className="flex-1">
                <span className="font-bold text-navy-900">{nameOf.get(l.student_id)}</span>
                <span className="ml-2 text-navy-900/55">{l.reason}</span>
              </span>
              <span className="text-xs text-navy-900/40">{formatDate(l.created_at.slice(0, 10))}</span>
              <ConfirmButton message="Remove this points entry?" onConfirm={deleteLedgerEntry.bind(null, l.id)} />
            </li>
          ))}
          {!ledger?.length && <li className="py-8 text-center text-sm text-navy-900/50">No entries yet.</li>}
        </ul>
      </Card>
    </>
  );
}
