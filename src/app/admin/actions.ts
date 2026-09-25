"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_KEYS, type ContentKey } from "@/lib/content";
import { slugify } from "@/lib/utils";

/** `at` makes every result unique, so the UI re-shows a toast even for a repeated message. */
export type ActionState = { ok: boolean; message: string; at?: number } | null;

const ok = (message: string): ActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): ActionState => ({ ok: false, message, at: Date.now() });
const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

async function admin() {
  await requireAdmin();
  return createClient();
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- settings
export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const { error } = await supabase
    .from("site_settings")
    .update({
      blur_attendance: bool(fd, "blur_attendance"),
      blur_activities: bool(fd, "blur_activities"),
      blur_points: bool(fd, "blur_points"),
      leaderboard_public: bool(fd, "leaderboard_public"),
      registration_open: bool(fd, "registration_open"),
      announcement: str(fd, "announcement"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) return fail(error.message);
  refreshPublic();
  return ok("Settings saved");
}

export async function toggleSetting(key: "blur_attendance" | "blur_activities" | "blur_points" | "leaderboard_public" | "registration_open", value: boolean) {
  const supabase = await admin();
  await supabase.from("site_settings").update({ [key]: value, updated_at: new Date().toISOString() }).eq("id", true);
  refreshPublic();
}

// ---------------------------------------------------------------- batches
export async function saveBatch(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const start = Number(str(fd, "start_year"));
  if (!start || start < 2000) return fail("Enter a valid start year");
  const end = start + 4;
  const label = `${String(start).slice(2)}-${String(end).slice(2)}`;
  const { error } = await supabase.from("batches").insert({ label, start_year: start, end_year: end });
  if (error) return fail(error.code === "23505" ? `Batch ${label} already exists` : error.message);
  refreshPublic();
  return ok(`Batch ${label} added`);
}

export async function setBatchActive(id: string, active: boolean) {
  const supabase = await admin();
  await supabase.from("batches").update({ is_active: active }).eq("id", id);
  refreshPublic();
}

// ---------------------------------------------------------------- students
export async function updateStudent(id: string, patch: { reveal_details?: boolean; role?: "student" | "admin"; batch_id?: string | null }) {
  const supabase = await admin();
  const me = await requireAdmin();
  if (patch.role === "student" && id === me.id) return fail("You can't remove your own admin access");
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  revalidatePath("/admin/students");
  return error ? fail(error.message) : ok("Updated");
}

export async function revealForBatch(batchId: string, reveal: boolean) {
  const supabase = await admin();
  await supabase.from("profiles").update({ reveal_details: reveal }).eq("batch_id", batchId).eq("role", "student");
  revalidatePath("/admin/students");
}

export async function deleteStudent(id: string) {
  const supabase = await admin();
  const me = await requireAdmin();
  if (id === me.id) return;
  // Removes the profile (and their attendance/points). The auth user row stays until removed in the Supabase dashboard.
  await supabase.from("profiles").delete().eq("id", id);
  revalidatePath("/admin/students");
}

// ---------------------------------------------------------------- events
export async function saveEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const event_date = str(fd, "event_date");
  if (!title || !event_date) return fail("Title and date are required");
  const register_url = str(fd, "register_url");
  if (register_url && !/^https:\/\//.test(register_url)) return fail("Register link must start with https://");

  const row = {
    title,
    slug: str(fd, "slug") ? slugify(str(fd, "slug")!) : slugify(`${title}-${event_date.slice(0, 4)}`),
    summary: str(fd, "summary"),
    description: str(fd, "description"),
    category: str(fd, "category") ?? "Community",
    event_date,
    location: str(fd, "location"),
    cover_url: str(fd, "cover_url"),
    register_url,
    points: Number(str(fd, "points") ?? 10),
    is_published: bool(fd, "is_published"),
  };
  const { error } = id ? await supabase.from("events").update(row).eq("id", id) : await supabase.from("events").insert(row);
  if (error) return fail(error.code === "23505" ? "Another event already uses that slug" : error.message);
  refreshPublic();
  return ok(id ? "Event updated" : "Event created");
}

export async function deleteEvent(id: string) {
  const supabase = await admin();
  await supabase.from("events").delete().eq("id", id);
  refreshPublic();
}

// ---------------------------------------------------------------- attendance
/**
 * Replace attendance for one event with the given set of present students, and keep the
 * points ledger in sync: every present student gets exactly one "Attended: <event>" entry.
 */
export async function saveAttendance(eventId: string, presentIds: string[], scopeIds: string[], awardPoints: boolean): Promise<ActionState> {
  const supabase = await admin();
  const { data: event } = await supabase.from("events").select("id, title, points").eq("id", eventId).single();
  if (!event) return fail("Event not found");

  const absent = scopeIds.filter((id) => !presentIds.includes(id));
  if (absent.length) {
    await supabase.from("attendance").delete().eq("event_id", eventId).in("student_id", absent);
    await supabase.from("points_ledger").delete().eq("event_id", eventId).in("student_id", absent).like("reason", "Attended:%");
  }
  if (presentIds.length) {
    const { error } = await supabase
      .from("attendance")
      .upsert(presentIds.map((student_id) => ({ student_id, event_id: eventId, status: "present" })), { onConflict: "student_id,event_id" });
    if (error) return fail(error.message);

    if (awardPoints) {
      const { data: existing } = await supabase.from("points_ledger").select("student_id").eq("event_id", eventId).like("reason", "Attended:%");
      const have = new Set((existing ?? []).map((r) => r.student_id));
      const fresh = presentIds.filter((id) => !have.has(id));
      if (fresh.length) {
        const { error: pErr } = await supabase
          .from("points_ledger")
          .insert(fresh.map((student_id) => ({ student_id, event_id: eventId, points: event.points, reason: `Attended: ${event.title}` })));
        if (pErr) return fail(pErr.message);
      }
    }
  }
  revalidatePath("/admin/attendance");
  refreshPublic();
  return ok(`Saved — ${presentIds.length} present`);
}

// ---------------------------------------------------------------- points / leaderboard
export async function awardPoints(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const ids = fd.getAll("student_id").filter((v): v is string => typeof v === "string" && v !== "");
  const points = Number(str(fd, "points"));
  const reason = str(fd, "reason");
  if (!ids.length) return fail("Pick at least one student");
  if (!Number.isFinite(points) || points === 0) return fail("Points must be a non-zero number");
  if (!reason) return fail("Add a reason");
  const { error } = await supabase.from("points_ledger").insert(ids.map((student_id) => ({ student_id, points, reason, event_id: str(fd, "event_id") })));
  if (error) return fail(error.message);
  revalidatePath("/admin/points");
  refreshPublic();
  return ok(`${points > 0 ? "Awarded" : "Deducted"} ${Math.abs(points)} pts × ${ids.length}`);
}

/** CSV upload: register_no,points,reason — one ledger entry per line. */
export async function importPointsCsv(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const csv = str(fd, "csv");
  if (!csv) return fail("Paste or upload CSV rows first");
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (/register/i.test(lines[0] ?? "")) lines.shift();

  const parsed = lines.map((l) => {
    const [reg, pts, ...rest] = l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    return { reg: reg?.toUpperCase(), points: Number(pts), reason: rest.join(",") || "Bulk import" };
  });
  const bad = parsed.filter((p) => !p.reg || !Number.isFinite(p.points));
  if (bad.length) return fail(`Couldn't parse ${bad.length} line(s). Format: register_no,points,reason`);

  const { data: students } = await supabase.from("profiles").select("id, register_no").in("register_no", parsed.map((p) => p.reg));
  const byReg = new Map((students ?? []).map((s) => [s.register_no, s.id]));
  const missing = parsed.filter((p) => !byReg.has(p.reg)).map((p) => p.reg);
  const rows = parsed.filter((p) => byReg.has(p.reg)).map((p) => ({ student_id: byReg.get(p.reg)!, points: p.points, reason: p.reason }));
  if (rows.length) {
    const { error } = await supabase.from("points_ledger").insert(rows);
    if (error) return fail(error.message);
  }
  revalidatePath("/admin/points");
  refreshPublic();
  return missing.length ? fail(`Imported ${rows.length}. Not found: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}`) : ok(`Imported ${rows.length} entries`);
}

export async function deleteLedgerEntry(id: string) {
  const supabase = await admin();
  await supabase.from("points_ledger").delete().eq("id", id);
  revalidatePath("/admin/points");
  refreshPublic();
}

// ---------------------------------------------------------------- office bearers
export async function saveOfficeBearer(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const position = str(fd, "position");
  const tenure = str(fd, "tenure");
  if (!name || !position || !tenure) return fail("Name, position and tenure are required");
  const row = {
    name,
    position,
    tenure,
    team: str(fd, "team") ?? "Office Bearers",
    department: str(fd, "department"),
    batch_id: str(fd, "batch_id"),
    photo_url: str(fd, "photo_url"),
    sort_order: Number(str(fd, "sort_order") ?? 100),
  };
  const { error } = id ? await supabase.from("office_bearers").update(row).eq("id", id) : await supabase.from("office_bearers").insert(row);
  if (error) return fail(error.message);
  refreshPublic();
  return ok(id ? "Updated" : `${name} added`);
}

export async function deleteOfficeBearer(id: string) {
  const supabase = await admin();
  await supabase.from("office_bearers").delete().eq("id", id);
  refreshPublic();
}

// ---------------------------------------------------------------- gallery
export async function addGalleryImages(urls: string[], eventId: string | null, caption: string | null): Promise<ActionState> {
  const supabase = await admin();
  if (!urls.length) return fail("No images uploaded");
  const { error } = await supabase.from("gallery").insert(urls.map((image_url, i) => ({ image_url, event_id: eventId, caption, sort_order: 100 + i })));
  if (error) return fail(error.message);
  refreshPublic();
  return ok(`${urls.length} photo(s) added`);
}

export async function deleteGalleryImage(id: string) {
  const supabase = await admin();
  const { data } = await supabase.from("gallery").select("image_url").eq("id", id).single();
  await supabase.from("gallery").delete().eq("id", id);
  const marker = "/storage/v1/object/public/media/";
  if (data?.image_url.includes(marker)) {
    await supabase.storage.from("media").remove([data.image_url.split(marker)[1]]);
  }
  refreshPublic();
}

export async function updateBatch(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const id = str(fd, "id");
  const start = Number(str(fd, "start_year"));
  const end = Number(str(fd, "end_year"));
  const label = str(fd, "label");
  if (!id || !label || !start || !end || end <= start) return fail("Enter a label and a valid start/end year");
  const { error } = await supabase.from("batches").update({ label, start_year: start, end_year: end }).eq("id", id);
  if (error) return fail(error.code === "23505" ? `Batch ${label} already exists` : error.message);
  refreshPublic();
  return ok(`Batch ${label} saved`);
}

export async function deleteBatch(id: string): Promise<ActionState> {
  const supabase = await admin();
  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("batch_id", id);
  if (count) return fail(`This batch still has ${count} students. Move them to another batch first.`);
  const { error } = await supabase.from("batches").delete().eq("id", id);
  if (error) return fail(error.message);
  refreshPublic();
  return ok("Batch deleted");
}

// ---------------------------------------------------------------- site content
export async function saveContent(key: ContentKey, value: unknown): Promise<ActionState> {
  if (!CONTENT_KEYS.includes(key)) return fail("Unknown section");
  const supabase = await admin();
  const { error } = await supabase.from("site_content").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) return fail(/site_content/.test(error.message) ? "Run migration 20260925000005_admin_control.sql in Supabase first" : error.message);
  refreshPublic();
  return ok("Saved. It's live on the site.");
}

export async function resetContent(key: ContentKey): Promise<ActionState> {
  if (!CONTENT_KEYS.includes(key)) return fail("Unknown section");
  const supabase = await admin();
  const { error } = await supabase.from("site_content").delete().eq("key", key);
  if (error) return fail(error.message);
  refreshPublic();
  return ok("Restored the original content");
}

// ---------------------------------------------------------------- student records
/** Adds a volunteer record (no account needed; they claim it by signing up with the same register number) or edits one. */
export async function saveStudent(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const id = str(fd, "id");
  const row = {
    full_name: str(fd, "full_name"),
    register_no: str(fd, "register_no")?.toUpperCase() ?? null,
    department: str(fd, "department"),
    section: str(fd, "section"),
    phone: str(fd, "phone"),
    batch_id: str(fd, "batch_id"),
  };
  if (!row.full_name) return fail("Name is required");
  const { error } = id ? await supabase.from("profiles").update(row).eq("id", id) : await supabase.from("profiles").insert({ ...row, role: "student" });
  if (error) return fail(error.code === "23505" ? "That register number is already in use" : error.message);
  revalidatePath("/admin/students");
  refreshPublic();
  return ok(id ? "Student updated" : `${row.full_name} added`);
}

/** CSV lines: register_no,full_name,department,section,batch,phone (batch as its label, e.g. 25-29). Existing register numbers are updated. */
export async function importStudentsCsv(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await admin();
  const csv = str(fd, "csv");
  if (!csv) return fail("Paste or load a CSV first");
  const { data: batches } = await supabase.from("batches").select("id, label");
  const batchId = new Map((batches ?? []).map((b) => [b.label, b.id]));
  const rows = [];
  const problems: string[] = [];
  for (const [n, line] of csv.split(/\r?\n/).entries()) {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (!line.trim() || /register/i.test(cells[0])) continue;
    const [register_no, full_name, department, section, batch, phone] = cells;
    if (!register_no || !full_name) {
      problems.push(`line ${n + 1}`);
      continue;
    }
    if (batch && !batchId.has(batch)) {
      problems.push(`line ${n + 1} (no batch ${batch})`);
      continue;
    }
    rows.push({
      register_no: register_no.toUpperCase(),
      full_name,
      department: department || null,
      section: section || null,
      batch_id: batch ? batchId.get(batch) : null,
      phone: phone || null,
    });
  }
  if (!rows.length) return fail(problems.length ? `Nothing imported. Check ${problems.slice(0, 5).join(", ")}` : "No rows found");
  const { error } = await supabase.from("profiles").upsert(rows, { onConflict: "register_no" });
  if (error) return fail(error.message);
  revalidatePath("/admin/students");
  refreshPublic();
  return problems.length ? fail(`Imported ${rows.length}. Skipped ${problems.slice(0, 5).join(", ")}`) : ok(`Imported ${rows.length} students`);
}
