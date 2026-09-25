import type { Metadata } from "next";
import Link from "next/link";
import { Lock, LogOut } from "lucide-react";
import { Lockable } from "@/components/dashboard/locked";
import { RegisterButton } from "@/components/site/event-card";
import { SectionLabel } from "@/components/site/landing/section-label";
import { CountUp, Reveal, SplitWords } from "@/components/ui/motion";
import { getBatches, getEvents, getLeaderboard, getSettings, requireStudent } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types";
import { NSS_HOUR, formatDate, initials, isUpcoming } from "@/lib/utils";

export const metadata: Metadata = { title: "My dashboard" };

type Activity = { id: string; status: string; role: string | null; events: Pick<EventItem, "title" | "slug" | "event_date" | "category" | "points"> | null };
type Ledger = { id: string; points: number; reason: string; created_at: string };

// Shown blurred when a section is locked — never real data.
const dummyActivities: Activity[] = Array.from({ length: 4 }, (_, i) => ({
  id: `d${i}`,
  status: "present",
  role: "Volunteer",
  events: { title: "NSS community event", slug: "#", event_date: "2026-01-01", category: "Outreach", points: 20 },
}));
const dummyLedger: Ledger[] = Array.from({ length: 4 }, (_, i) => ({ id: `d${i}`, points: 20, reason: "Event participation", created_at: "2026-01-01" }));

export default async function DashboardPage() {
  const profile = await requireStudent();
  const [settings, batches, events] = await Promise.all([getSettings(), getBatches(), getEvents()]);
  const supabase = await createClient();

  const revealed = {
    attendance: profile.reveal_details || !settings.blur_attendance || profile.role === "admin",
    activities: profile.reveal_details || !settings.blur_activities || profile.role === "admin",
    points: profile.reveal_details || !settings.blur_points || profile.role === "admin",
  };

  const [{ data: attendance }, { data: ledger }] = await Promise.all([
    revealed.attendance || revealed.activities
      ? supabase.from("attendance").select("id, status, role, events(title, slug, event_date, category, points)").eq("student_id", profile.id)
      : Promise.resolve({ data: null }),
    revealed.points ? supabase.from("points_ledger").select("id, points, reason, created_at").eq("student_id", profile.id).order("created_at", { ascending: false }) : Promise.resolve({ data: null }),
  ]);

  const marked = ((attendance ?? []) as unknown as Activity[])
    .filter((a) => a.events)
    .sort((a, b) => b.events!.event_date.localeCompare(a.events!.event_date));
  // Weekly NSS hours drive the attendance percentage; everything else is an activity
  const activities = marked.filter((a) => a.events!.category !== NSS_HOUR);
  const present = activities.filter((a) => a.status === "present");
  const hoursPresent = marked.filter((a) => a.events!.category === NSS_HOUR && a.status === "present").length;
  const batch = batches.find((b) => b.id === profile.batch_id);
  const since = batch ? `${batch.start_year}-07-01` : profile.created_at.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const { count: hoursHeld } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("category", NSS_HOUR)
    .gte("event_date", since)
    .lte("event_date", today);
  const eventsHeld = events.filter((e) => !isUpcoming(e.event_date) && e.event_date >= since).length;
  const attendancePct = hoursHeld ? Math.round((hoursPresent / hoursHeld) * 100) : eventsHeld ? Math.round((present.length / eventsHeld) * 100) : 0;
  const totalPoints = (ledger ?? []).reduce((s, l) => s + l.points, 0);

  let rank: number | null = null;
  if (revealed.points && batch && settings.leaderboard_public) {
    const board = await getLeaderboard(batch.id);
    rank = board.find((r) => r.student_id === profile.id)?.rank ?? null;
  }

  const upcoming = events.filter((e) => isUpcoming(e.event_date)).reverse().slice(0, 3);

  return (
    <div className="bg-white px-5 pb-24 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <section className="pb-10 pt-24 sm:pt-28">
          <SectionLabel label="Student dashboard" aside={batch ? `Batch ${batch.label}` : "NSS LICET"} />
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-end gap-5">
              <span className="grid h-20 w-20 shrink-0 place-items-center bg-navy-600 font-poster text-3xl text-white sm:h-24 sm:w-24 sm:text-4xl">{initials(profile.full_name)}</span>
              <div>
                <p className="font-display text-[15px] font-medium text-ink/55">Welcome back,</p>
                <h1 className="font-serif text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.03em] text-ink">
                  <SplitWords text={profile.full_name} />
                </h1>
                <p className="mt-2 font-display text-[15px] text-ink/60">
                  {profile.department} {batch && <>· Batch {batch.label}</>}
                </p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button className="inline-flex items-center gap-2 border border-ink/20 px-5 py-2.5 font-display text-[15px] font-semibold text-ink transition-colors hover:border-nss-red hover:text-nss-red">
                <LogOut size={16} /> Sign out
              </button>
            </form>
          </div>
        </section>

        {/* Figures */}
        <div className="grid grid-cols-2 border-y border-ink lg:grid-cols-4">
          <StatCard label="Total points" locked={!revealed.points} value={totalPoints} />
          <StatCard label="Batch rank" locked={!revealed.points} value={rank ?? 0} prefix="#" empty={!rank} />
          <StatCard label="Events attended" locked={!revealed.activities} value={present.length} />
          <StatCard label="Attendance" locked={!revealed.attendance} value={attendancePct} suffix="%" />
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          {/* Activities */}
          <Panel index="01" title="My activities">
            <Lockable locked={!revealed.activities} label="Activities">
              <ActivityList items={revealed.activities ? activities : dummyActivities} />
            </Lockable>
          </Panel>

          <div className="space-y-14">
            {/* Student details — always visible */}
            <Panel index="02" title="My details">
              <dl className="text-[15px]">
                <Row k="Register no." v={profile.register_no ?? "—"} />
                <Row k="Department" v={profile.department ?? "—"} />
                <Row k="Batch" v={batch?.label ?? "—"} />
                <Row k="Email" v={profile.email ?? "—"} />
                <Row k="Phone" v={profile.phone ?? "—"} />
              </dl>
            </Panel>

            {/* Involvement / points ledger */}
            <Panel index="03" title="Involvement">
              <Lockable locked={!revealed.points} label="Points">
                <ul>
                  {(revealed.points ? (ledger ?? []) : dummyLedger).slice(0, 6).map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-4 border-b border-ink/10 py-3 text-[15px]">
                      <span>
                        <span className="font-semibold text-ink">{l.reason}</span>
                        <span className="block font-display text-[13px] text-ink/50">{formatDate(l.created_at.slice(0, 10))}</span>
                      </span>
                      <span className={`font-poster text-2xl ${l.points >= 0 ? "text-navy-600" : "text-nss-red"}`}>
                        {l.points >= 0 ? "+" : ""}
                        {l.points}
                      </span>
                    </li>
                  ))}
                  {revealed.points && !ledger?.length && <li className="py-6 font-display text-ink/50">No points yet. Join an event!</li>}
                </ul>
              </Lockable>
              {batch && (
                <Link href={`/leaderboard/${batch.label}`} className="mt-5 inline-block font-display text-[15px] font-semibold text-nss-red underline-offset-4 hover:underline">
                  View batch {batch.label} leaderboard ↗
                </Link>
              )}
            </Panel>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="mt-16">
            <Panel index="04" title="Register for upcoming events">
              <ul>
                {upcoming.map((e) => (
                  <li key={e.id} className="grid items-center gap-3 border-b border-ink/10 py-5 sm:grid-cols-[8rem_1fr_auto] sm:gap-6">
                    <span className="font-display text-[15px] text-ink/55">{formatDate(e.event_date)}</span>
                    <div>
                      <Link href={`/events/${e.slug}`} className="font-serif text-[1.7rem] leading-tight text-ink transition-colors hover:text-nss-red">
                        {e.title}
                      </Link>
                      <p className="font-display text-[14px] text-ink/50">
                        {e.location} · {e.points} pts
                      </p>
                    </div>
                    <RegisterButton event={e} />
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, locked, prefix = "", suffix = "", empty = false }: { label: string; value: number; locked: boolean; prefix?: string; suffix?: string; empty?: boolean }) {
  return (
    <div className="relative border-ink/15 px-4 py-6 odd:border-r lg:border-r lg:px-6 lg:last:border-r-0">
      <p className="flex items-center justify-between gap-2 font-display text-[14px] font-medium text-ink/55">
        {label}
        {locked && (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-nss-red">
            <Lock size={12} /> Locked
          </span>
        )}
      </p>
      {locked ? (
        <p className="mt-2 select-none font-poster text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-navy-600 blur-[6px]" aria-label="Locked">
          {prefix}88{suffix}
        </p>
      ) : empty ? (
        <p className="mt-2 font-poster text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-ink/20">—</p>
      ) : (
        <p className="mt-2 font-poster text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-navy-600">
          {prefix}
          <CountUp to={value} suffix={suffix} />
        </p>
      )}
    </div>
  );
}

function Panel({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section>
        <div className="h-[3px] bg-ink" />
        <p className="mt-3 flex items-center gap-2.5 font-display text-[14px] font-medium text-nss-red">
          <span className="h-2.5 w-2.5 bg-nss-red" /> {index}
        </p>
        <h2 className="mb-5 mt-1 font-serif text-[clamp(2rem,3vw,2.8rem)] leading-none text-ink">{title}</h2>
        {children}
      </section>
    </Reveal>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/10 py-3">
      <dt className="font-display text-ink/50">{k}</dt>
      <dd className="truncate text-right font-semibold text-ink">{v}</dd>
    </div>
  );
}

function ActivityList({ items }: { items: Activity[] }) {
  if (!items.length) return <p className="py-10 font-display text-ink/50">No activities recorded yet.</p>;
  return (
    <ol>
      {items.map((a) => (
        <li key={a.id} className="grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-4 border-b border-ink/10 py-4">
          <span className="font-display text-[14px] text-ink/50">{formatDate(a.events!.event_date)}</span>
          <div className="min-w-0">
            <Link href={`/events/${a.events!.slug}`} className="font-serif text-[1.45rem] leading-tight text-ink transition-colors hover:text-nss-red">
              {a.events!.title}
            </Link>
            <p className="font-display text-[13px] text-ink/50">
              {a.events!.category}
              {a.role && ` · ${a.role}`}
            </p>
          </div>
          <span
            className={`font-display text-[13px] font-semibold uppercase tracking-[0.08em] ${a.status === "present" ? "text-navy-600" : a.status === "excused" ? "text-ink/50" : "text-nss-red"}`}
          >
            {a.status}
          </span>
        </li>
      ))}
    </ol>
  );
}
