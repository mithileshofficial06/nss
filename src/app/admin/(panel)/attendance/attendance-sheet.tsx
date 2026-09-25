"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Check, Download, Loader2, Plus, RotateCcw, Search } from "lucide-react";
import { createNssHour, saveAttendance, type ActionState } from "../../actions";
import { Card, Switch, Toast, input, inputAuto } from "@/components/admin/ui";
import type { Batch } from "@/lib/types";
import { DEPARTMENTS, NSS_HOUR, cn, formatDate } from "@/lib/utils";

type Student = { id: string; full_name: string; register_no: string | null; department: string | null; batch_id: string | null };
type Ev = { id: string; title: string; event_date: string; points: number; category: string; location: string | null };
type Show = "all" | "present" | "absent";

export function AttendanceSheet({ events, eventId, students, batches, initialPresent }: { events: Ev[]; eventId: string; students: Student[]; batches: Batch[]; initialPresent: string[] }) {
  const router = useRouter();
  const [present, setPresent] = useState(new Set(initialPresent));
  const [batch, setBatch] = useState(() => batches.find((b) => b.label === "25-29")?.id ?? "all");
  const [dept, setDept] = useState<string>("all");
  const [show, setShow] = useState<Show>("all");
  const [q, setQ] = useState("");
  const [award, setAward] = useState(true);
  const [toast, setToast] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const [newHour, setNewHour] = useState<{ date: string; location: string } | null>(null);
  const event = events.find((e) => e.id === eventId)!;
  const isHour = event.category === NSS_HOUR;
  const today = new Date().toISOString().slice(0, 10);

  const groups = useMemo(
    () => [
      { label: "Upcoming", items: events.filter((e) => e.event_date > today && e.category !== NSS_HOUR).reverse() },
      { label: "Events", items: events.filter((e) => e.event_date <= today && e.category !== NSS_HOUR) },
      { label: "NSS hours", items: events.filter((e) => e.category === NSS_HOUR) },
    ],
    [events, today],
  );

  // Batch + search narrow the roster; department and present/absent are applied on top
  const inScope = useMemo(() => {
    const s = q.trim().toLowerCase();
    return students.filter((r) => (batch === "all" || r.batch_id === batch) && (!s || r.full_name.toLowerCase().includes(s) || r.register_no?.toLowerCase().includes(s)));
  }, [students, batch, q]);
  const rows = inScope.filter((r) => (dept === "all" || r.department === dept) && (show === "all" || (show === "present") === present.has(r.id)));
  const deptCounts = DEPARTMENTS.map((d) => {
    const all = inScope.filter((r) => r.department === d);
    return { d, total: all.length, here: all.filter((r) => present.has(r.id)).length };
  }).filter((x) => x.total);

  const presentInScope = inScope.filter((r) => present.has(r.id)).length;
  const initial = new Set(initialPresent);
  const changes = students.filter((s) => present.has(s.id) !== initial.has(s.id)).length;
  const toggle = (id: string) =>
    setPresent((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const setShown = (on: boolean) =>
    setPresent((p) => {
      const n = new Set(p);
      rows.forEach((r) => (on ? n.add(r.id) : n.delete(r.id)));
      return n;
    });

  function save() {
    // Save every student whose mark changed, plus everyone in the current view
    const scope = Array.from(new Set([...inScope.map((r) => r.id), ...students.filter((s) => present.has(s.id) !== initial.has(s.id)).map((s) => s.id)]));
    start(async () => {
      setToast(await saveAttendance(eventId, scope.filter((id) => present.has(id)), scope, award && !isHour));
      router.refresh();
    });
  }

  function exportCsv() {
    const lines = students
      .filter((s) => present.has(s.id))
      .map((s) => [s.full_name, s.register_no, s.department, batches.find((b) => b.id === s.batch_id)?.label].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([["Name,Register no,Department,Batch", ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `attendance-${event.event_date}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Event picker */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-72 flex-1">
            <span className="mb-1.5 block font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/55">Event or NSS hour</span>
            <select value={eventId} onChange={(e) => router.push(`/admin/attendance?event=${e.target.value}`)} className={input}>
              {groups.map(
                (g) =>
                  g.items.length > 0 && (
                    <optgroup key={g.label} label={g.label}>
                      {g.items.map((e) => (
                        <option key={e.id} value={e.id}>
                          {formatDate(e.event_date)} · {e.title}
                        </option>
                      ))}
                    </optgroup>
                  ),
              )}
            </select>
          </label>
          {newHour ? (
            <div className="flex flex-wrap items-end gap-2">
              <input type="date" value={newHour.date} onChange={(e) => setNewHour({ ...newHour, date: e.target.value })} className={inputAuto} aria-label="NSS hour date" />
              <input value={newHour.location} onChange={(e) => setNewHour({ ...newHour, location: e.target.value })} className={cn(inputAuto, "w-28")} aria-label="Venue" placeholder="Venue" />
              <button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await createNssHour(newHour.date, newHour.location);
                    if (res.error) return setToast({ ok: false, message: res.error, at: Date.now() });
                    router.push(`/admin/attendance?event=${res.id}`);
                  })
                }
                className="bg-ink px-4 py-2.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-nss-red disabled:opacity-60"
              >
                Create
              </button>
              <button onClick={() => setNewHour(null)} className="px-2 py-2.5 font-display text-[14px] text-ink/55 hover:text-ink">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setNewHour({ date: today, location: "D23" })}
              className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 font-display text-[15px] font-semibold text-ink transition-colors hover:border-ink"
            >
              <Plus size={16} /> New NSS hour
            </button>
          )}
        </div>

        {/* Event summary */}
        <div className="mt-5 grid gap-4 border-t border-ink pt-4 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-nss-red">{isHour ? "NSS hour" : event.category}</p>
            <p className="font-serif text-[2rem] leading-tight text-ink">{event.title}</p>
            <p className="font-display text-[14px] text-ink/55">
              {formatDate(event.event_date)}
              {event.location && ` · ${event.location}`}
              {!isHour && ` · ${event.points} pts per attendee`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-poster text-[3.2rem] leading-none text-navy-600">
              {presentInScope}
              <span className="text-[1.6rem] text-ink/30">/{inScope.length}</span>
            </p>
            <p className="font-display text-[14px] text-ink/55">present{inScope.length ? ` · ${Math.round((presentInScope / inScope.length) * 100)}%` : ""}</p>
          </div>
        </div>
      </Card>

      {/* Roster */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or register no." className={cn(input, "pl-9")} />
          </div>
          <select value={batch} onChange={(e) => setBatch(e.target.value)} className={inputAuto} aria-label="Batch">
            <option value="all">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch {b.label}
              </option>
            ))}
          </select>
          <div className="flex border border-ink/20 font-display text-[14px] font-semibold" role="group" aria-label="Show">
            {(["all", "present", "absent"] as Show[]).map((s) => (
              <button key={s} onClick={() => setShow(s)} className={cn("px-3 py-2 capitalize", show === s ? "bg-ink text-white" : "text-ink/60 hover:text-ink")}>
                {s === "all" ? "Everyone" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Department chips double as filters */}
        <div className="mt-4 flex flex-wrap gap-2 font-display text-[14px]">
          <Chip active={dept === "all"} onClick={() => setDept("all")} label="All" count={`${presentInScope}/${inScope.length}`} />
          {deptCounts.map((c) => (
            <Chip key={c.d} active={dept === c.d} onClick={() => setDept(dept === c.d ? "all" : c.d)} label={c.d} count={`${c.here}/${c.total}`} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-ink/15 py-2.5 font-display text-[14px]">
          <span className="text-ink/60">{rows.length} shown</span>
          <span className="flex items-center gap-4">
            <button onClick={() => setShown(true)} className="font-semibold text-navy-600 hover:underline">
              Mark all shown present
            </button>
            <button onClick={() => setShown(false)} className="font-semibold text-nss-red hover:underline">
              Clear shown
            </button>
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 font-semibold text-ink/70 hover:text-ink">
              <Download size={14} /> CSV
            </button>
          </span>
        </div>

        <ul className="grid sm:grid-cols-2">
          {rows.map((r) => {
            const on = present.has(r.id);
            const changed = on !== initial.has(r.id);
            return (
              <li key={r.id} className="border-b border-ink/10 sm:odd:border-r">
                <button type="button" onClick={() => toggle(r.id)} className={cn("flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors", on ? "bg-navy-100/70" : "hover:bg-paper")}>
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center border-2 transition", on ? "border-navy-600 bg-navy-600 text-white" : "border-ink/25")}>
                    {on && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{r.full_name}</span>
                    <span className="font-display text-[13px] text-ink/50">
                      {[r.register_no, r.department].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {changed && <span className="h-2 w-2 shrink-0 bg-nss-red" title="Unsaved change" />}
                </button>
              </li>
            );
          })}
          {!rows.length && <li className="col-span-full py-10 text-center font-display text-ink/50">No students match these filters.</li>}
        </ul>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-nss-red bg-ink px-5 py-4 text-white">
        <span className="font-display text-[15px]">
          <b className="font-poster text-2xl">{present.size}</b> present overall
          {changes > 0 && <span className="ml-2 text-navy-200">· {changes} unsaved change{changes === 1 ? "" : "s"}</span>}
        </span>
        <span className="flex flex-wrap items-center gap-4">
          {!isHour && (
            <span className="flex items-center gap-2 font-display text-[14px] text-white/80">
              Auto-award {event.points} pts <Switch checked={award} onChange={setAward} />
            </span>
          )}
          {changes > 0 && (
            <button onClick={() => setPresent(new Set(initialPresent))} className="inline-flex items-center gap-1.5 font-display text-[14px] text-white/70 hover:text-white">
              <RotateCcw size={14} /> Undo
            </button>
          )}
          <button
            disabled={pending}
            onClick={save}
            className="inline-flex items-center gap-2 bg-nss-red px-5 py-2.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-ink disabled:opacity-60"
          >
            {pending && <Loader2 size={16} className="animate-spin" />} Save attendance
          </button>
        </span>
      </div>
      <Toast state={toast} />
    </div>
  );
}

function Chip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: string }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-2 border px-3 py-1.5 transition-colors", active ? "border-ink bg-ink text-white" : "border-ink/20 text-ink hover:border-ink")}>
      <span className="font-semibold">{label}</span>
      <span className={cn("tabular-nums", active ? "text-white/70" : "text-ink/45")}>{count}</span>
    </button>
  );
}
