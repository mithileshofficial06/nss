"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { saveAttendance, type ActionState } from "../../actions";
import { Card, Switch, Toast, input } from "@/components/admin/ui";
import type { Batch } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type Student = { id: string; full_name: string; register_no: string | null; department: string | null; section: string | null; batch_id: string | null };
type Ev = { id: string; title: string; event_date: string; points: number };

export function AttendanceSheet({ events, eventId, students, batches, initialPresent }: { events: Ev[]; eventId: string; students: Student[]; batches: Batch[]; initialPresent: string[] }) {
  const router = useRouter();
  const [present, setPresent] = useState(new Set(initialPresent));
  const [batch, setBatch] = useState("all");
  const [q, setQ] = useState("");
  const [award, setAward] = useState(true);
  const [toast, setToast] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const event = events.find((e) => e.id === eventId);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return students.filter((r) => (batch === "all" || r.batch_id === batch) && (!s || r.full_name.toLowerCase().includes(s) || r.register_no?.toLowerCase().includes(s)));
  }, [students, batch, q]);

  const toggle = (id: string) =>
    setPresent((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allShown = rows.length > 0 && rows.every((r) => present.has(r.id));
  const dirty = present.size !== initialPresent.length || initialPresent.some((id) => !present.has(id));

  return (
    <Card>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <select value={eventId} onChange={(e) => router.push(`/admin/attendance?event=${e.target.value}`)} className={input}>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {formatDate(e.event_date)} — {e.title}
            </option>
          ))}
        </select>
        <select value={batch} onChange={(e) => setBatch(e.target.value)} className={input}>
          <option value="all">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              Batch {b.label}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className={cn(input, "pl-9")} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3">
        <label className="flex items-center gap-3 text-sm font-semibold text-navy-900">
          <input
            type="checkbox"
            checked={allShown}
            onChange={() =>
              setPresent((p) => {
                const n = new Set(p);
                rows.forEach((r) => (allShown ? n.delete(r.id) : n.add(r.id)));
                return n;
              })
            }
            className="h-4 w-4 accent-nss-red"
          />
          Select all shown ({rows.length})
        </label>
        <span className="flex items-center gap-3 text-sm text-navy-900/70">
          Auto-award {event?.points ?? 0} pts <Switch checked={award} onChange={setAward} />
        </span>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => {
          const on = present.has(r.id);
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => toggle(r.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  on ? "border-emerald-500 bg-emerald-50" : "border-navy-900/10 hover:border-navy-900/30",
                )}
              >
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition", on ? "border-emerald-500 bg-emerald-500 text-white" : "border-navy-900/20")}>
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-navy-900">{r.full_name}</span>
                  <span className="text-xs text-navy-900/50">
                    {r.register_no} · {r.department} {r.section}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {!rows.length && <li className="col-span-full py-10 text-center text-sm text-navy-900/50">No students in this filter.</li>}
      </ul>

      <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-4 rounded-2xl bg-navy-900 px-5 py-4 text-white shadow-2xl">
        <span className="text-sm">
          <b className="font-display text-xl">{present.size}</b> marked present {dirty && <span className="ml-2 text-accent">· unsaved changes</span>}
        </span>
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveAttendance(eventId, Array.from(present).filter((id) => rows.some((r) => r.id === id)), rows.map((r) => r.id), award);
              setToast(res);
              router.refresh();
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-ink disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />} Save attendance
        </button>
      </div>
      <Toast state={toast} />
    </Card>
  );
}
