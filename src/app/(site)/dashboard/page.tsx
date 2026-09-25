import type { Metadata } from "next";
import Link from "next/link";
import { Award, CalendarCheck2, Flame, Hash, LogOut, Mail, Phone, TrendingUp, Trophy } from "lucide-react";
import { Lockable } from "@/components/dashboard/locked";
import { RegisterButton } from "@/components/site/event-card";
import { CountUp, Reveal } from "@/components/ui/motion";
import { NssWheel } from "@/components/ui/nss-wheel";
import { getBatches, getEvents, getLeaderboard, getSettings, requireStudent } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types";
import { formatDate, initials, isUpcoming } from "@/lib/utils";

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

  const activities = ((attendance ?? []) as unknown as Activity[])
    .filter((a) => a.events)
    .sort((a, b) => b.events!.event_date.localeCompare(a.events!.event_date));
  const present = activities.filter((a) => a.status === "present");
  const batch = batches.find((b) => b.id === profile.batch_id);
  const since = batch ? `${batch.start_year}-07-01` : profile.created_at.slice(0, 10);
  const heldSinceJoining = events.filter((e) => !isUpcoming(e.event_date) && e.event_date >= since).length;
  const attendancePct = heldSinceJoining ? Math.round((present.length / heldSinceJoining) * 100) : 0;
  const totalPoints = (ledger ?? []).reduce((s, l) => s + l.points, 0);

  let rank: number | null = null;
  if (revealed.points && batch && settings.leaderboard_public) {
    const board = await getLeaderboard(batch.id);
    rank = board.find((r) => r.student_id === profile.id)?.rank ?? null;
  }

  const upcoming = events.filter((e) => isUpcoming(e.event_date)).reverse().slice(0, 3);

  return (
    <div className="bg-paper pb-24">
      {/* Header */}
      <section className="grain relative overflow-hidden bg-navy-950 px-6 pb-28 pt-36 text-white">
        <NssWheel spin className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 text-white/[0.05]" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-nss-red/25 blur-[120px]" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6">
          <Reveal className="flex items-center gap-5">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-nss-red to-saffron font-display text-3xl font-extrabold shadow-xl">
              {initials(profile.full_name)}
            </span>
            <div>
              <p className="text-sm text-white/55">Welcome back,</p>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{profile.full_name}</h1>
              <p className="mt-1 text-sm text-white/60">
                {[profile.department, profile.section].filter(Boolean).join(" · ")} {batch && <>· Batch {batch.label}</>}
              </p>
            </div>
          </Reveal>
          <form action="/auth/signout" method="post">
            <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80 hover:bg-white hover:text-navy-950">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </section>

      <div className="relative mx-auto -mt-16 max-w-7xl space-y-8 px-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Award} label="Total points" locked={!revealed.points} value={totalPoints} accent="from-saffron to-orange-400" />
          <StatCard icon={Trophy} label="Batch rank" locked={!revealed.points} value={rank ?? 0} prefix="#" empty={!rank} accent="from-navy-600 to-navy-800" />
          <StatCard icon={CalendarCheck2} label="Events attended" locked={!revealed.activities} value={present.length} accent="from-nss-red to-ember" />
          <StatCard icon={TrendingUp} label="Attendance" locked={!revealed.attendance} value={attendancePct} suffix="%" accent="from-emerald-500 to-teal-600" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Activities */}
          <Panel title="My activities" icon={Flame}>
            <Lockable locked={!revealed.activities} label="Activities">
              <ActivityList items={revealed.activities ? activities : dummyActivities} />
            </Lockable>
          </Panel>

          <div className="space-y-8">
            {/* Student details — always visible */}
            <Panel title="My details" icon={Hash}>
              <dl className="space-y-3 text-sm">
                <Row k="Register no." v={profile.register_no ?? "—"} />
                <Row k="Department" v={[profile.department, profile.section].filter(Boolean).join(" · ") || "—"} />
                <Row k="Batch" v={batch?.label ?? "—"} />
                <Row k={<Mail size={14} />} v={profile.email} />
                <Row k={<Phone size={14} />} v={profile.phone ?? "—"} />
              </dl>
            </Panel>

            {/* Involvement / points ledger */}
            <Panel title="Involvement" icon={Award}>
              <Lockable locked={!revealed.points} label="Points">
                <ul className="space-y-2">
                  {(revealed.points ? (ledger ?? []) : dummyLedger).slice(0, 6).map((l) => (
                    <li key={l.id} className="flex items-center justify-between rounded-xl bg-paper px-4 py-3 text-sm">
                      <span>
                        <span className="font-semibold text-navy-900">{l.reason}</span>
                        <span className="block text-xs text-navy-900/50">{formatDate(l.created_at.slice(0, 10))}</span>
                      </span>
                      <span className={`font-display text-lg font-extrabold ${l.points >= 0 ? "text-emerald-600" : "text-nss-red"}`}>
                        {l.points >= 0 ? "+" : ""}
                        {l.points}
                      </span>
                    </li>
                  ))}
                  {revealed.points && !ledger?.length && <li className="py-6 text-center text-sm text-navy-900/50">No points yet — join an event!</li>}
                </ul>
              </Lockable>
              {batch && (
                <Link href={`/leaderboard/${batch.label}`} className="mt-4 inline-block text-sm font-bold text-nss-red hover:underline">
                  View batch {batch.label} leaderboard →
                </Link>
              )}
            </Panel>
          </div>
        </div>

        {upcoming.length > 0 && (
          <Panel title="Register for upcoming events" icon={CalendarCheck2}>
            <ul className="divide-y divide-navy-900/5">
              {upcoming.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <Link href={`/events/${e.slug}`} className="font-bold text-navy-900 hover:text-nss-red">
                      {e.title}
                    </Link>
                    <p className="text-xs text-navy-900/50">
                      {formatDate(e.event_date)} · {e.location} · {e.points} pts
                    </p>
                  </div>
                  <RegisterButton event={e} />
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  locked,
  accent,
  prefix = "",
  suffix = "",
  empty = false,
}: {
  icon: typeof Award;
  label: string;
  value: number;
  locked: boolean;
  accent: string;
  prefix?: string;
  suffix?: string;
  empty?: boolean;
}) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border border-navy-900/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,18,53,.45)]">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white ${accent}`}>
          <Icon size={20} />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-navy-900/45">{label}</p>
        {locked ? (
          <p className="mt-1 select-none font-display text-4xl font-extrabold text-navy-900 blur-sm" aria-label="Locked">
            {prefix}88{suffix}
          </p>
        ) : empty ? (
          <p className="mt-1 font-display text-4xl font-extrabold text-navy-900/30">—</p>
        ) : (
          <p className="mt-1 font-display text-4xl font-extrabold text-navy-900">
            {prefix}
            <CountUp to={value} suffix={suffix} />
          </p>
        )}
        {locked && <span className="absolute right-5 top-5 rounded-full bg-navy-900/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-900/55">Locked</span>}
      </div>
    </Reveal>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Award; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-[0_20px_50px_-35px_rgba(10,18,53,.45)] sm:p-7">
        <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-extrabold text-navy-900">
          <Icon size={20} className="text-nss-red" /> {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-navy-900/5 pb-3 last:border-0 last:pb-0">
      <dt className="text-navy-900/50">{k}</dt>
      <dd className="truncate text-right font-semibold text-navy-900">{v}</dd>
    </div>
  );
}

function ActivityList({ items }: { items: Activity[] }) {
  if (!items.length) return <p className="py-10 text-center text-sm text-navy-900/50">No activities recorded yet.</p>;
  return (
    <ol className="relative space-y-4 border-l-2 border-dashed border-navy-900/10 pl-6">
      {items.map((a) => (
        <li key={a.id} className="relative">
          <span className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-white ${a.status === "present" ? "bg-emerald-500" : a.status === "excused" ? "bg-saffron" : "bg-nss-red"}`} />
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper px-4 py-3">
            <div>
              <Link href={`/events/${a.events!.slug}`} className="font-bold text-navy-900 hover:text-nss-red">
                {a.events!.title}
              </Link>
              <p className="text-xs text-navy-900/50">
                {formatDate(a.events!.event_date)} · {a.events!.category}
                {a.role && ` · ${a.role}`}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-navy-900/70">{a.status}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
