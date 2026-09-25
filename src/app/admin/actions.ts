"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
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
