"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PersonCard } from "./person-card";
import type { Batch, OfficeBearer } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TeamBrowser({ people, batches }: { people: OfficeBearer[]; batches: Batch[] }) {
  const tenures = Array.from(new Set(people.map((p) => p.tenure))).sort().reverse();
  const [tenure, setTenure] = useState(tenures[0]);
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const inTenure = people.filter((p) => p.tenure === tenure);
  const batchIds = Array.from(new Set(inTenure.map((p) => p.batch_id).filter(Boolean))) as string[];
  const visible = batchFilter === "all" ? inTenure : inTenure.filter((p) => p.batch_id === batchFilter);
  const teams = Array.from(new Set(visible.map((p) => p.team)));
  const batchLabel = (id: string) => batches.find((b) => b.id === id)?.label ?? "—";

  if (!people.length) return <p className="text-center text-navy-900/50">Team list coming soon.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-navy-900/45">Tenure</span>
        {tenures.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTenure(t);
              setBatchFilter("all");
            }}
            className={cn("rounded-full px-4 py-2 text-sm font-bold transition", t === tenure ? "bg-navy-900 text-white" : "bg-white text-navy-900/70 hover:text-navy-900")}
          >
            {t}
          </button>
        ))}
        <span className="ml-4 text-xs font-bold uppercase tracking-[0.2em] text-navy-900/45">Batch</span>
        {["all", ...batchIds].map((id) => (
          <button
            key={id}
            onClick={() => setBatchFilter(id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold transition",
              batchFilter === id ? "border-nss-red bg-nss-red text-white" : "border-navy-900/15 text-navy-900/65 hover:border-navy-900/40",
            )}
          >
            {id === "all" ? "All" : batchLabel(id)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${tenure}-${batchFilter}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
          {teams.map((team) => (
            <div key={team} className="mt-14">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-900">{team}</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {visible
                  .filter((p) => p.team === team)
                  .map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                      <PersonCard person={p} />
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
