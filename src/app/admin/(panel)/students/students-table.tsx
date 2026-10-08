"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Download, Eye, EyeOff, MousePointerClick, Plus, Search } from "lucide-react";
import { StudentPanel, type StudentRow } from "./student-form";
import { revealForBatch } from "../../actions";
import { Card, input, inputAuto } from "@/components/admin/ui";
import type { Batch } from "@/lib/types";
import { DEPARTMENTS, cn } from "@/lib/utils";

/** Student list on the left; the selected student's details stay beside it on the right (above it on narrow screens). */
export function StudentsTable({ students, batches }: { students: StudentRow[]; batches: Batch[] }) {
  const [q, setQ] = useState("");
  const [batch, setBatch] = useState("all");
  const [dept, setDept] = useState("all");
  // A student's id, "new" for the add form, or null. Looked up in `students` so saved edits show at once.
  const [selected, setSelected] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const current = selected && selected !== "new" ? (students.find((s) => s.id === selected) ?? null) : null;
  const [pending, start] = useTransition();
  const label = (id: string | null) => batches.find((b) => b.id === id)?.label ?? "—";

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return students.filter(
      (r) =>
        (batch === "all" || r.batch_id === batch) &&
        (dept === "all" || r.department === dept) &&
        (!s || [r.full_name, r.email ?? "", r.register_no ?? ""].some((v) => v.toLowerCase().includes(s))),
    );
  }, [students, q, batch, dept]);

  function select(id: string) {
    setSelected(id);
    // Side by side from xl up; below that the panel sits above the list, so bring it into view
    if (!window.matchMedia("(min-width: 1280px)").matches) requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function exportCsv() {
    const header = ["Name", "Register no", "Email", "Phone", "Department", "Batch", "Points", "Events attended", "Role"];
    const lines = rows.map((r) => [r.full_name, r.register_no, r.email, r.phone, r.department, label(r.batch_id), r.points, r.attended, r.role].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nss-students${batch !== "all" ? `-${label(batch)}` : ""}.csv`;
    a.click();
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <Card className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, register no." className={cn(input, "pl-9")} />
          </div>
          <select value={batch} onChange={(e) => setBatch(e.target.value)} className={inputAuto}>
            <option value="all">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch {b.label}
              </option>
            ))}
          </select>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputAuto}>
            <option value="all">All depts</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink hover:bg-paper">
            <Download size={16} /> CSV
          </button>
          <button onClick={() => select("new")} className="inline-flex items-center gap-2 bg-nss-red px-4 py-2.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-navy-600">
            <Plus size={16} /> Add student
          </button>
        </div>

        {batch !== "all" && (
          <div className="mt-4 flex flex-wrap items-center gap-2 bg-paper p-3 text-sm">
            <span className="font-semibold text-ink">Batch {label(batch)} dashboards:</span>
            <button disabled={pending} onClick={() => start(() => revealForBatch(batch, true))} className="inline-flex items-center gap-1.5 bg-navy-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
              <Eye size={14} /> Reveal all
            </button>
            <button disabled={pending} onClick={() => start(() => revealForBatch(batch, false))} className="inline-flex items-center gap-1.5 bg-ink px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
              <EyeOff size={14} /> Follow global blur
            </button>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/45">
                <th className="py-3 pl-3 pr-3 font-bold">Student</th>
                <th className="py-3 pr-3 font-bold">Register no.</th>
                <th className="py-3 pr-3 font-bold">Dept</th>
                <th className="py-3 pr-3 font-bold">Batch</th>
                <th className="py-3 pr-3 text-right font-bold">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const active = r.id === selected;
                return (
                  <tr
                    key={r.id}
                    onClick={() => select(r.id)}
                    aria-selected={active}
                    className={cn(
                      "cursor-pointer border-b border-ink/10 transition-colors last:border-0",
                      active ? "bg-navy-100 shadow-[inset_3px_0_0_var(--color-navy-600)]" : "hover:bg-paper/60",
                    )}
                  >
                    <td className="py-3 pl-3 pr-3">
                      <button type="button" className={cn("text-left font-bold transition-colors", active ? "text-navy-800" : "text-ink hover:text-nss-red")}>
                        {r.full_name}
                      </button>
                      <p className="text-xs text-ink/50">
                        {r.email ?? <span className="text-nss-red/80">Not signed up yet</span>}
                        {r.role === "admin" && <span className="ml-1.5 font-bold text-navy-800">· Admin</span>}
                      </p>
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs">{r.register_no ?? "—"}</td>
                    <td className="py-3 pr-3">{r.department ?? "—"}</td>
                    <td className="py-3 pr-3">{label(r.batch_id)}</td>
                    <td className="py-3 pr-3 text-right font-display font-semibold text-ink">{r.points}</td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink/50">
                    No students match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <aside ref={panelRef} aria-label="Student details" className="order-first scroll-mt-20 xl:sticky xl:top-6 xl:order-none xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
        {selected === "new" || current ? (
          <StudentPanel key={selected} student={current} batches={batches} onClose={() => setSelected(null)} />
        ) : (
          <div className="hidden border border-dashed border-ink/20 p-8 text-center xl:block">
            <MousePointerClick size={28} className="mx-auto text-ink/30" />
            <p className="mt-3 font-display text-[15px] text-ink/55">Select a student to see and edit their details here.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
