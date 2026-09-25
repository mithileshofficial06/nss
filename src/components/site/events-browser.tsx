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
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-3">
        <div className="flex gap-8">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setCategory("All");
              }}
              className={cn("relative font-serif text-[clamp(2rem,3vw,2.8rem)] capitalize leading-none transition-colors", tab === t ? "text-ink" : "text-ink/30 hover:text-ink/60")}
            >
              {t}
              <sup className="ml-1 font-display text-[14px] font-medium">{t === "upcoming" ? upcoming.length : past.length}</sup>
              {tab === t && <motion.span layoutId="events-tab" className="absolute -bottom-[14px] left-0 h-[3px] w-full bg-nss-red" />}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-display text-[15px] font-medium">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={cn("transition-colors", category === c ? "text-nss-red" : "text-ink/50 hover:text-ink")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-20 text-center font-serif text-3xl text-ink/40">
          {tab === "upcoming" ? "No upcoming events announced yet." : "No events here yet."}
        </p>
      ) : (
        <motion.div layout className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((e, i) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
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
