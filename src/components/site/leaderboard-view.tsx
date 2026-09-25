"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Search } from "lucide-react";
import type { LeaderboardRow } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const podiumStyle = [
  { order: "order-2", height: "h-44", ring: "ring-saffron", bg: "bg-saffron", label: "1st" },
  { order: "order-1", height: "h-32", ring: "ring-navy-200", bg: "bg-navy-200", label: "2nd" },
  { order: "order-3", height: "h-24", ring: "ring-orange-300", bg: "bg-orange-300", label: "3rd" },
];

export function LeaderboardView({ rows, highlightId }: { rows: LeaderboardRow[]; highlightId?: string }) {
  const [q, setQ] = useState("");
  const top = rows.slice(0, 3);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => r.full_name.toLowerCase().includes(s) || r.department?.toLowerCase().includes(s)) : rows;
  }, [q, rows]);
  const max = rows[0]?.points || 1;

  if (!rows.length) {
    return <p className="rounded-3xl border border-dashed border-navy-900/20 p-12 text-center text-navy-900/50">No standings yet for this batch.</p>;
  }

  return (
    <div>
      {/* Podium */}
      <div className="mx-auto flex max-w-2xl items-end justify-center gap-3 sm:gap-6">
        {top.map((r, i) => {
          const s = podiumStyle[i];
          return (
            <motion.div
              key={r.student_id}
              className={cn("flex w-1/3 flex-col items-center", s.order)}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (2 - i) * 0.15, type: "spring", stiffness: 120, damping: 14 }}
            >
              {i === 0 && <Crown className="mb-1 text-saffron" size={30} />}
              <div className={cn("grid h-16 w-16 place-items-center rounded-full bg-navy-900 font-display text-xl font-extrabold text-white ring-4 sm:h-20 sm:w-20", s.ring)}>
                {initials(r.full_name)}
              </div>
              <p className="mt-3 line-clamp-1 text-center text-sm font-bold text-navy-900">{r.full_name}</p>
              <p className="text-xs font-semibold text-navy-900/50">{r.points} pts</p>
              <motion.div
                className={cn("mt-3 flex w-full items-start justify-center rounded-t-2xl pt-3 font-display text-2xl font-extrabold text-ink", s.bg)}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ delay: 0.4 + (2 - i) * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={s.height}>{s.label}</div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <div className="mt-14 overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-[0_20px_60px_-35px_rgba(10,18,53,.5)]">
        <div className="flex items-center gap-3 border-b border-navy-900/10 px-5 py-4">
          <Search size={18} className="text-navy-900/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or department"
            className="w-full bg-transparent text-sm outline-none placeholder:text-navy-900/40"
          />
        </div>
        <ol>
          {filtered.map((r, i) => (
            <motion.li
              key={r.student_id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 10) * 0.03 }}
              className={cn(
                "grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-navy-900/5 px-5 py-3.5 last:border-0 sm:grid-cols-[3rem_1fr_12rem_5rem]",
                r.student_id === highlightId && "bg-saffron/15",
              )}
            >
              <span className={cn("grid h-9 w-9 place-items-center rounded-full font-display text-sm font-extrabold", r.rank <= 3 ? "bg-navy-900 text-white" : "bg-navy-100 text-navy-900")}>
                {r.rank <= 3 ? <Medal size={16} /> : r.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-navy-900">
                  {r.full_name} {r.student_id === highlightId && <span className="ml-1 rounded-full bg-nss-red px-2 py-0.5 text-[10px] text-white">You</span>}
                </p>
                <p className="text-xs text-navy-900/50">
                  {r.department ?? "—"} · {r.events_attended} events
                </p>
              </div>
              <div className="hidden h-2 overflow-hidden rounded-full bg-navy-100 sm:block">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-nss-red to-saffron"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(r.points / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-right font-display text-lg font-extrabold text-navy-900">{r.points}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
