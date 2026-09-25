"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EventCard } from "./event-card";
import type { EventItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EventsBrowser({ upcoming, past }: { upcoming: EventItem[]; past: EventItem[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">(upcoming.length ? "upcoming" : "past");
  const [category, setCategory] = useState("All");
  const list = tab === "upcoming" ? upcoming : past;
  const categories = useMemo(() => ["All", ...Array.from(new Set(list.map((e) => e.category)))], [list]);
  const shown = category === "All" ? list : list.filter((e) => e.category === category);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex rounded-full border border-navy-900/10 bg-white p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setCategory("All");
              }}
              className={cn("relative rounded-full px-6 py-2.5 text-sm font-bold capitalize transition-colors", tab === t ? "text-white" : "text-navy-900/60 hover:text-navy-900")}
            >
              {tab === t && <motion.span layoutId="events-tab" className="absolute inset-0 -z-0 rounded-full bg-navy-900" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">
                {t} <span className="opacity-60">({t === "upcoming" ? upcoming.length : past.length})</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                category === c ? "border-nss-red bg-nss-red text-white" : "border-navy-900/15 text-navy-900/65 hover:border-navy-900/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-16 rounded-3xl border border-dashed border-navy-900/20 p-12 text-center text-navy-900/50">
          {tab === "upcoming" ? "No upcoming events announced yet — check back soon." : "No events here yet."}
        </p>
      ) : (
        <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((e, i) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <EventCard event={e} upcoming={tab === "upcoming"} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
