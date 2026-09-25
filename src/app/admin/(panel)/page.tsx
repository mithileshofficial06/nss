import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, Eye, Trophy, Users } from "lucide-react";
import { toggleSetting } from "../actions";
import { Card, LiveSwitch, PageTitle } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminOverview() {
  const supabase = await createClient();
  const settings = await getSettings();
  const head = { count: "exact", head: true } as const;
  const [students, events, attendance, recent] = await Promise.all([
    supabase.from("profiles").select("*", head).eq("role", "student"),
    supabase.from("events").select("*", head),
    supabase.from("attendance").select("*", head),
    supabase.from("profiles").select("id, full_name, department, register_no, created_at, batches(label)").eq("role", "student").order("created_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    { label: "Registered students", value: students.count ?? 0, icon: Users, href: "/admin/students" },
    { label: "Events", value: events.count ?? 0, icon: CalendarDays, href: "/admin/events" },
    { label: "Attendance marks", value: attendance.count ?? 0, icon: ClipboardCheck, href: "/admin/attendance" },
  ];

  const toggles = [
    { key: "blur_activities", label: "Blur activities on student dashboards", value: settings.blur_activities },
    { key: "blur_attendance", label: "Blur attendance on student dashboards", value: settings.blur_attendance },
    { key: "blur_points", label: "Blur points & involvement", value: settings.blur_points },
    { key: "leaderboard_public", label: "Leaderboard visible to public", value: settings.leaderboard_public },
    { key: "registration_open", label: "Student registration open", value: settings.registration_open },
  ] as const;

  return (
    <>
      <PageTitle title="Overview" description="Everything on the NSS portal, managed from here." />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-3xl bg-navy-900 p-6 text-white transition hover:-translate-y-0.5 hover:shadow-xl">
            <s.icon className="text-accent" />
            <p className="mt-4 font-display text-4xl font-extrabold">{s.value}</p>
            <p className="mt-1 flex items-center justify-between text-sm text-white/60">
              {s.label} <ArrowRight size={16} className="opacity-0 transition group-hover:opacity-100" />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Quick visibility controls" description="Changes apply instantly to every student.">
          <ul className="divide-y divide-navy-900/5">
            {toggles.map((t) => (
              <li key={t.key} className="flex items-center justify-between gap-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                  <Eye size={16} className="text-navy-900/40" /> {t.label}
                </span>
                <LiveSwitch initial={t.value} action={toggleSetting.bind(null, t.key)} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-navy-900/45">Tip: reveal details for individual students or a whole batch from the Students page.</p>
        </Card>

        <Card title="Latest registrations" actions={<Link href="/admin/students" className="text-sm font-bold text-nss-red">All students →</Link>}>
          <ul className="divide-y divide-navy-900/5">
            {(recent.data ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="font-bold text-navy-900">{p.full_name}</span>
                  <span className="block text-xs text-navy-900/50">
                    {p.register_no} · {p.department} · {(p.batches as unknown as { label: string } | null)?.label ?? "No batch"}
                  </span>
                </span>
                <span className="text-xs text-navy-900/45">{formatDate(p.created_at.slice(0, 10))}</span>
              </li>
            ))}
            {!recent.data?.length && <li className="py-6 text-center text-sm text-navy-900/50">No students yet.</li>}
          </ul>
        </Card>
      </div>

      <Card className="mt-6" title="Common tasks">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/admin/events", label: "Add an event & Google Form link", icon: CalendarDays },
            { href: "/admin/attendance", label: "Mark attendance for an event", icon: ClipboardCheck },
            { href: "/admin/points", label: "Update the batch leaderboard", icon: Trophy },
          ].map((t) => (
            <Link key={t.href} href={t.href} className="flex items-center gap-3 rounded-2xl border border-navy-900/10 p-4 text-sm font-bold text-navy-900 transition hover:border-navy-900 hover:bg-paper">
              <t.icon size={18} className="text-nss-red" /> {t.label}
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
