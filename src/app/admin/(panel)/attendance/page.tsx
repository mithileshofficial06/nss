import type { Metadata } from "next";
import Link from "next/link";
import { AttendanceRegister, type RegisterRow } from "./attendance-register";
import { AttendanceSheet } from "./attendance-sheet";
import { PageTitle } from "@/components/admin/ui";
import { getBatches } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { NSS_HOUR, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Attendance" };

export default async function AttendancePage({ searchParams }: PageProps<"/admin/attendance">) {
  const sp = await searchParams;
  const view = sp.view === "register" ? "register" : "mark";
  const supabase = await createClient();
  const [{ data: events }, { data: students }, batches] = await Promise.all([
    supabase.from("events").select("id, title, event_date, points, category, location").order("event_date", { ascending: false }),
    supabase.from("profiles").select("id, full_name, register_no, department, batch_id").eq("role", "student").order("full_name"),
    getBatches(),
  ]);

  return (
    <>
      <PageTitle title="Attendance" description="Mark who came to each event or NSS hour, and review every student's attendance register." />
      <div className="mb-6 flex gap-6 border-b border-ink/15 font-display text-[16px] font-semibold">
        {[
          { key: "mark", label: "Mark attendance" },
          { key: "register", label: "Register" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/admin/attendance${t.key === "register" ? "?view=register" : ""}`}
            className={cn("-mb-px border-b-2 pb-2 transition-colors", view === t.key ? "border-nss-red text-nss-red" : "border-transparent text-ink/55 hover:text-ink")}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {view === "mark" ? <Mark events={events ?? []} students={students ?? []} batches={batches} eventParam={sp.event} /> : <Register batches={batches} batchParam={sp.batch} students={students ?? []} />}
    </>
  );
}

async function Mark({ events, students, batches, eventParam }: { events: Ev[]; students: Student[]; batches: Awaited<ReturnType<typeof getBatches>>; eventParam: string | string[] | undefined }) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  // Default to the most recent event or NSS hour that has already happened
  const eventId = typeof eventParam === "string" ? eventParam : (events.find((e) => e.event_date <= today) ?? events[0])?.id;
  if (!eventId) return <p className="text-ink/60">Create an event first.</p>;
  const { data: marked } = await supabase.from("attendance").select("student_id").eq("event_id", eventId).eq("status", "present");
  return (
    <AttendanceSheet key={eventId} events={events} eventId={eventId} students={students} batches={batches} initialPresent={(marked ?? []).map((m) => m.student_id)} />
  );
}

async function Register({ batches, batchParam, students }: { batches: Awaited<ReturnType<typeof getBatches>>; batchParam: string | string[] | undefined; students: Student[] }) {
  const supabase = await createClient();
  const batch = batches.find((b) => b.label === batchParam) ?? batches.find((b) => b.label === "25-29") ?? batches[0];
  if (!batch) return <p className="text-ink/60">Add a batch in Settings first.</p>;
  const today = new Date().toISOString().slice(0, 10);
  const since = `${batch.start_year}-07-01`;
  const inBatch = students.filter((s) => s.batch_id === batch.id);
  const ids = inBatch.map((s) => s.id);

  const [{ data: sessions }, { count: eventsHeld }, { data: marks }] = await Promise.all([
    supabase.from("events").select("id, event_date").eq("category", NSS_HOUR).gte("event_date", since).lte("event_date", today).order("event_date"),
    supabase.from("events").select("id", { count: "exact", head: true }).neq("category", NSS_HOUR).gte("event_date", since).lte("event_date", today),
    ids.length
      ? supabase.from("attendance").select("student_id, event_id, events(category)").in("student_id", ids).eq("status", "present").limit(10000)
      : Promise.resolve({ data: [] as { student_id: string; event_id: string; events: unknown }[] }),
  ]);

  const byStudent = new Map<string, { hours: Set<string>; events: number }>();
  for (const m of marks ?? []) {
    const rec = byStudent.get(m.student_id) ?? { hours: new Set<string>(), events: 0 };
    if ((m.events as { category?: string } | null)?.category === NSS_HOUR) rec.hours.add(m.event_id);
    else rec.events += 1;
    byStudent.set(m.student_id, rec);
  }
  const rows: RegisterRow[] = inBatch.map((s) => {
    const rec = byStudent.get(s.id);
    const attended = (sessions ?? []).filter((x) => rec?.hours.has(x.id)).length;
    return {
      id: s.id,
      name: s.full_name,
      register_no: s.register_no,
      department: s.department,
      hours: (sessions ?? []).map((x) => rec?.hours.has(x.id) ?? false),
      hoursAttended: attended,
      pct: sessions?.length ? Math.round((attended / sessions.length) * 100) : null,
      events: rec?.events ?? 0,
    };
  });

  return <AttendanceRegister batches={batches.map((b) => b.label)} batch={batch.label} sessions={(sessions ?? []).map((s) => s.event_date)} eventsHeld={eventsHeld ?? 0} rows={rows} />;
}

type Ev = { id: string; title: string; event_date: string; points: number; category: string; location: string | null };
type Student = { id: string; full_name: string; register_no: string | null; department: string | null; batch_id: string | null };
