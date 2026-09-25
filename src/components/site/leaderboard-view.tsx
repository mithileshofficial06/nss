"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LeaderboardRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const ordinal = ["1st", "2nd", "3rd"];

export function LeaderboardView({ rows, highlightId }: { rows: LeaderboardRow[]; highlightId?: string }) {
  const [q, setQ] = useState("");
  const top = rows.slice(0, 3);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => r.full_name.toLowerCase().includes(s) || r.department?.toLowerCase().includes(s)) : rows;
  }, [q, rows]);
  const max = rows[0]?.points || 1;

  if (!rows.length) {
    return <p className="py-20 text-center font-serif text-3xl text-ink/40">No standings yet for this batch.</p>;
  }

  return (
    <div>
      {/* Top three as a ruled three-column spread */}
      <ol className="grid border-y border-ink md:grid-cols-3">
        {top.map((r, i) => (
          <motion.li
            key={r.student_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease }}
            className={cn("flex flex-col justify-between gap-10 border-ink/15 py-8 md:px-8 md:first:pl-0", i > 0 && "border-t md:border-l md:border-t-0")}
          >
            <div className="flex items-baseline justify-between font-display text-[15px] font-medium text-ink/50">
              <span>{r.department}</span>
              <span>{r.events_attended} events</span>
            </div>
            <div>
              <p className={cn("font-serif text-[clamp(4rem,8vw,7.5rem)] italic leading-[0.8] tracking-[-0.03em]", i === 0 ? "text-nss-red" : "text-navy-600")}>{ordinal[i]}</p>
              <p className="mt-4 font-serif text-3xl leading-tight text-ink">{r.full_name}</p>
              <p className="font-display text-[16px] font-medium text-ink/55">{r.points} points</p>
            </div>
          </motion.li>
        ))}
      </ol>

      {/* Full standings */}
      <div className="mt-14 flex items-baseline justify-between gap-6 border-b border-ink pb-3">
        <h2 className="font-serif text-4xl text-ink">Standings</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or department"
          className="w-56 border-b border-ink/20 bg-transparent py-1 font-display text-[15px] outline-none placeholder:text-ink/35 focus:border-nss-red"
        />
      </div>
      <ol>
        {filtered.map((r, i) => (
          <motion.li
            key={r.student_id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.03, ease }}
            className={cn(
              "group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-ink/15 py-4 transition-colors hover:text-nss-red sm:grid-cols-[4rem_1fr_14rem_5rem]",
              r.student_id === highlightId && "bg-paper",
            )}
          >
            <span className="font-display text-[14px] font-medium text-ink/40 tabular-nums group-hover:text-nss-red">{String(r.rank).padStart(2, "0")}</span>
            <span className="font-serif text-2xl leading-none">
              {r.full_name}
              {r.student_id === highlightId && <span className="ml-2 font-display text-[13px] font-semibold text-nss-red">You</span>}
              <span className="ml-3 font-display text-[14px] text-ink/45">{r.department}</span>
            </span>
            <span className="hidden h-px self-center bg-ink/10 sm:block">
              <motion.span
                className="block h-[3px] -translate-y-px bg-nss-red"
                initial={{ width: 0 }}
                whileInView={{ width: `${(r.points / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease }}
              />
            </span>
            <span className="text-right font-display text-xl font-semibold tabular-nums">{r.points}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
