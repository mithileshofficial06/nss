"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Eye, EyeOff, Search } from "lucide-react";
import { deleteStudent, revealForBatch, updateStudent, type ActionState } from "../../actions";
import { Card, ConfirmButton, LiveSwitch, Toast, input } from "@/components/admin/ui";
import type { Batch, Profile } from "@/lib/types";
import { DEPARTMENTS, cn } from "@/lib/utils";

type Row = Profile & { points: number; attended: number };

export function StudentsTable({ students, batches }: { students: Row[]; batches: Batch[] }) {
  const [q, setQ] = useState("");
  const [batch, setBatch] = useState("all");
  const [dept, setDept] = useState("all");
  const [toast, setToast] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const label = (id: string | null) => batches.find((b) => b.id === id)?.label ?? "—";

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return students.filter(
      (r) =>
        (batch === "all" || r.batch_id === batch) &&
        (dept === "all" || r.department === dept) &&
        (!s || [r.full_name, r.email, r.register_no ?? ""].some((v) => v.toLowerCase().includes(s))),
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
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, register no." className={cn(input, "pl-9")} />
        </div>
        <select value={batch} onChange={(e) => setBatch(e.target.value)} className={cn(input, "w-auto")}>
          <option value="all">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              Batch {b.label}
            </option>
          ))}
        </select>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={cn(input, "w-auto")}>
          <option value="all">All depts</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-paper">
          <Download size={16} /> CSV
        </button>
      </div>

      {batch !== "all" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-paper p-3 text-sm">
          <span className="font-semibold text-navy-900">Batch {label(batch)} dashboards:</span>
          <button disabled={pending} onClick={() => start(() => revealForBatch(batch, true))} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            <Eye size={14} /> Reveal all
          </button>
          <button disabled={pending} onClick={() => start(() => revealForBatch(batch, false))} className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            <EyeOff size={14} /> Follow global blur
          </button>
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-900/10 text-xs uppercase tracking-wider text-navy-900/45">
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
              <tr key={r.id} className="border-b border-navy-900/5 last:border-0 hover:bg-paper/60">
                <td className="py-3 pr-3">
                  <p className="font-bold text-navy-900">{r.full_name}</p>
                  <p className="text-xs text-navy-900/50">
                    {r.email}
                    {r.phone && ` · ${r.phone}`}
                  </p>
                </td>
                <td className="py-3 pr-3 font-mono text-xs">{r.register_no ?? "—"}</td>
                <td className="py-3 pr-3">{[r.department, r.section].filter(Boolean).join(" ") || "—"}</td>
                <td className="py-3 pr-3">
                  <select
                    defaultValue={r.batch_id ?? ""}
                    onChange={(e) => start(async () => setToast(await updateStudent(r.id, { batch_id: e.target.value || null })))}
                    className="rounded-lg border border-navy-900/10 bg-white px-2 py-1 text-xs"
                  >
                    <option value="">—</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-3 text-right font-display font-extrabold text-navy-900">{r.points}</td>
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
                    className={cn("rounded-lg border px-2 py-1 text-xs font-bold", r.role === "admin" ? "border-accent bg-accent/15 text-navy-900" : "border-navy-900/10 bg-white")}
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
                <td colSpan={9} className="py-12 text-center text-navy-900/50">
                  No students match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast state={toast} />
    </Card>
  );
}
