import type { Metadata } from "next";
import { AttendanceSheet } from "./attendance-sheet";
import { PageTitle } from "@/components/admin/ui";
import { getBatches } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Attendance" };

export default async function AttendancePage({ searchParams }: PageProps<"/admin/attendance">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: events }, { data: students }, batches] = await Promise.all([
    supabase.from("events").select("id, title, event_date, points").order("event_date", { ascending: false }),
    supabase.from("profiles").select("id, full_name, register_no, department, section, batch_id").eq("role", "student").order("full_name"),
    getBatches(),
  ]);
  const eventId = typeof sp.event === "string" ? sp.event : events?.[0]?.id;
  const { data: marked } = eventId ? await supabase.from("attendance").select("student_id").eq("event_id", eventId).eq("status", "present") : { data: [] };

  return (
    <>
      <PageTitle title="Attendance" description="Tick who attended. Points for the event are awarded automatically." />
      {eventId ? (
        <AttendanceSheet
          key={eventId}
          events={events ?? []}
          eventId={eventId}
          students={students ?? []}
          batches={batches}
          initialPresent={(marked ?? []).map((m) => m.student_id)}
        />
      ) : (
        <p className="text-ink/60">Create an event first.</p>
      )}
    </>
  );
}
