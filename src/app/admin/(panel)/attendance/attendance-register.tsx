"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, inputAuto } from "@/components/admin/ui";
import { DEPARTMENTS, cn } from "@/lib/utils";

export type RegisterRow = {
  id: string;
  name: string;
  register_no: string | null;
  department: string | null;
  /** One entry per NSS hour held, oldest first: attended or not */
  hours: boolean[];
  hoursAttended: number;
  pct: number | null;
  events: number;
};

/** NSS-hour percentage below which a student is flagged */
const THRESHOLD = 75;
type Sort = "pct" | "name" | "events";

/** Batch-wide attendance register, laid out like the ABSL hour sheet: one square per NSS hour. */
export function AttendanceRegister({ batches, batch, sessions, eventsHeld, rows }: { batches: string[]; batch: string; sessions: string[]; eventsHeld: number; rows: RegisterRow[] }) {
  const router = useRouter();
  const [dept, setDept] = useState("all");
  const [sort, setSort] = useState<Sort>("pct");
  const [lowOnly, setLowOnly] = useState(false);

  const shown = useMemo(() => {
    const list = rows.filter((r) => (dept === "all" || r.department === dept) && (!lowOnly || (r.pct ?? 100) < THRESHOLD));
    return list.sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : sort === "events" ? b.events - a.events || a.name.localeCompare(b.name) : (a.pct ?? 101) - (b.pct ?? 101) || a.name.localeCompare(b.name),
    );
  }, [rows, dept, sort, lowOnly]);

  const withPct = rows.filter((r) => r.pct !== null);
  const avg = withPct.length ? Math.round(withPct.reduce((s, r) => s + (r.pct ?? 0), 0) / withPct.length) : null;
  const low = withPct.filter((r) => (r.pct ?? 100) < THRESHOLD).length;
  const short = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  function exportCsv() {
    const header = ["Name", "Register no", "Department", ...sessions.map(short), "NSS hours", "NSS hour %", "Events attended"];
    const lines = shown.map((r) => [r.name, r.register_no, r.department, ...r.hours.map((h) => (h ? "P" : "")), `${r.hoursAttended}/${sessions.length}`, r.pct ?? "", r.events]);
    const csv = [header, ...lines].map((l) => l.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `nss-attendance-register-${batch}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="grid border-y border-ink sm:grid-cols-4">
        <Figure label="Students" value={String(rows.length)} />
        <Figure label="NSS hours held" value={String(sessions.length)} />
        <Figure label="Average NSS-hour attendance" value={avg === null ? "—" : `${avg}%`} />
        <Figure label={`Below ${THRESHOLD}%`} value={String(low)} alert={low > 0} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <select value={batch} onChange={(e) => router.push(`/admin/attendance?view=register&batch=${e.target.value}`)} className={inputAuto} aria-label="Batch">
            {batches.map((b) => (
              <option key={b} value={b}>
                Batch {b}
              </option>
            ))}
          </select>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputAuto} aria-label="Department">
            <option value="all">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={inputAuto} aria-label="Sort">
            <option value="pct">Lowest attendance first</option>
            <option value="name">Name A–Z</option>
            <option value="events">Most events</option>
          </select>
          <label className="flex items-center gap-2 font-display text-[14px] font-semibold text-ink">
            <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="h-4 w-4 accent-nss-red" />
            Only below {THRESHOLD}%
          </label>
          <button onClick={exportCsv} className="ml-auto inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 font-display text-[15px] font-semibold text-ink transition-colors hover:border-ink">
            <Download size={16} /> CSV
          </button>
        </div>

        <p className="mt-3 font-display text-[13px] text-ink/50">
          Each square is one NSS hour, oldest first (filled = present). Events attended counts drives and programmes out of {eventsHeld} held since the batch joined.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink text-xs uppercase tracking-wider text-ink/45">
                <th className="py-2.5 pr-3 font-semibold">Student</th>
                <th className="py-2.5 pr-3 font-semibold">Dept</th>
                <th className="py-2.5 pr-3 font-semibold">NSS hours</th>
                <th className="py-2.5 pr-3 text-right font-semibold">%</th>
                <th className="py-2.5 text-right font-semibold">Events</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const isLow = r.pct !== null && r.pct < THRESHOLD;
                return (
                  <tr key={r.id} className="border-b border-ink/10">
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-ink">{r.name}</p>
                      <p className="font-mono text-[11px] text-ink/45">{r.register_no ?? "—"}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-ink/70">{r.department ?? "—"}</td>
                    <td className="py-2.5 pr-3">
                      <span className="flex gap-[3px]">
                        {r.hours.map((h, i) => (
                          <span key={i} title={`${short(sessions[i])}: ${h ? "present" : "absent"}`} className={cn("h-3.5 w-3.5 border", h ? "border-navy-600 bg-navy-600" : "border-ink/20")} />
                        ))}
                      </span>
                    </td>
                    <td className={cn("py-2.5 pr-3 text-right font-poster text-lg", isLow ? "text-nss-red" : "text-navy-600")}>{r.pct === null ? "—" : `${r.pct}%`}</td>
                    <td className="py-2.5 text-right font-poster text-lg text-ink">{r.events}</td>
                  </tr>
                );
              })}
              {!shown.length && (
                <tr>
                  <td colSpan={5} className="py-10 text-center font-display text-ink/50">
                    No students match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Figure({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="border-ink/15 px-1 py-5 sm:border-r sm:px-5 sm:first:pl-1 sm:last:border-r-0">
      <p className="font-display text-[14px] font-medium text-ink/55">{label}</p>
      <p className={cn("mt-1 font-poster text-[2.6rem] leading-none", alert ? "text-nss-red" : "text-navy-600")}>{value}</p>
    </div>
  );
}
