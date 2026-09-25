"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Eye, EyeOff, Plus, Search } from "lucide-react";
import { StudentForm } from "./student-form";
import { deleteStudent, revealForBatch, updateStudent, type ActionState } from "../../actions";
import { Card, ConfirmButton, LiveSwitch, Toast, input, inputAuto } from "@/components/admin/ui";
import type { Batch, Profile } from "@/lib/types";
import { DEPARTMENTS, cn } from "@/lib/utils";

type Row = Profile & { points: number; attended: number };

export function StudentsTable({ students, batches }: { students: Row[]; batches: Batch[] }) {
  const [q, setQ] = useState("");
  const [batch, setBatch] = useState("all");
  const [dept, setDept] = useState("all");
  const [toast, setToast] = useState<ActionState>(null);
  const [editing, setEditing] = useState<Profile | "new" | null>(null);
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

  function exportCsv() {
    const header = ["Name", "Register no", "Email", "Phone", "Department", "Section", "Batch", "Points", "Events attended", "Role"];
    const lines = rows.map((r) => [r.full_name, r.register_no, r.email, r.phone, r.department, r.section, label(r.batch_id), r.points, r.attended, r.role].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nss-students${batch !== "all" ? `-${label(batch)}` : ""}.csv`;
    a.click();
  }

  return (
    <>
      {editing && <StudentForm student={editing === "new" ? null : editing} batches={batches} onClose={() => setEditing(null)} />}
      <Card>
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
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 bg-nss-red px-4 py-2.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-navy-600">
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
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/45">
                <th className="py-3 pr-3 font-bold">Student</th>
                <th className="py-3 pr-3 font-bold">Register no.</th>
                <th className="py-3 pr-3 font-bold">Dept</th>
                <th className="py-3 pr-3 font-bold">Batch</th>
                <th className="py-3 pr-3 text-right font-bold">Points</th>
                <th className="py-3 pr-3 text-right font-bold">Events</th>
                <th className="py-3 pr-3 font-bold" title="Always show this student's dashboard details, regardless of global blur">
                  Reveal
                </th>
                <th className="py-3 pr-3 font-bold">Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink/10 last:border-0 hover:bg-paper/60">
                  <td className="py-3 pr-3">
                    <button onClick={() => setEditing(r)} className="text-left font-bold text-ink transition-colors hover:text-nss-red" title="Edit details">
                      {r.full_name}
                    </button>
                    <p className="text-xs text-ink/50">
                      {r.email ?? <span className="text-nss-red/80">Not signed up yet</span>}
                      {r.phone && ` · ${r.phone}`}
                    </p>
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs">{r.register_no ?? "—"}</td>
                  <td className="py-3 pr-3">{[r.department, r.section].filter(Boolean).join(" ") || "—"}</td>
                  <td className="py-3 pr-3">
                    <select
                      defaultValue={r.batch_id ?? ""}
                      onChange={(e) => start(async () => setToast(await updateStudent(r.id, { batch_id: e.target.value || null })))}
                      className="border border-ink/10 bg-white px-2 py-1 text-xs"
                    >
                      <option value="">—</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3 text-right font-display font-semibold text-ink">{r.points}</td>
                  <td className="py-3 pr-3 text-right">{r.attended}</td>
                  <td className="py-3 pr-3">
                    <LiveSwitch initial={r.reveal_details} action={(v) => updateStudent(r.id, { reveal_details: v })} />
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      defaultValue={r.role}
                      onChange={(e) => {
                        const role = e.target.value as "student" | "admin";
                        if (role === "admin" && !confirm(`Give ${r.full_name} full admin access?`)) {
                          e.target.value = r.role;
                          return;
                        }
                        start(async () => setToast(await updateStudent(r.id, { role })));
                      }}
                      className={cn("border px-2 py-1 text-xs font-bold", r.role === "admin" ? "border-navy-600 bg-navy-100 text-navy-800" : "border-ink/10 bg-white")}
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <ConfirmButton message={`Remove ${r.full_name}? Their attendance and points will be deleted too.`} onConfirm={() => deleteStudent(r.id)} />
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-ink/50">
                    No students match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Toast state={toast} />
      </Card>
    </>
  );
}
