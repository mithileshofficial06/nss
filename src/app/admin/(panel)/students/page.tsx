import type { Metadata } from "next";
import { StudentsTable } from "./students-table";
import { PageTitle } from "@/components/admin/ui";
import { getBatches } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage() {
  const supabase = await createClient();
  const [{ data }, batches, { data: ledger }, { data: attendance }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    getBatches(),
    supabase.from("points_ledger").select("student_id, points"),
    supabase.from("attendance").select("student_id").eq("status", "present"),
  ]);

  const points = new Map<string, number>();
  (ledger ?? []).forEach((l) => points.set(l.student_id, (points.get(l.student_id) ?? 0) + l.points));
  const attended = new Map<string, number>();
  (attendance ?? []).forEach((a) => attended.set(a.student_id, (attended.get(a.student_id) ?? 0) + 1));

  const students = ((data ?? []) as Profile[]).map((p) => ({ ...p, points: points.get(p.id) ?? 0, attended: attended.get(p.id) ?? 0 }));

  return (
    <>
      <PageTitle title="Students" description={`${students.filter((s) => s.role === "student").length} registered volunteers`} />
      <StudentsTable students={students} batches={batches} />
    </>
  );
}
