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
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-ink pb-3 font-display text-[15px] font-medium">
        <span className="text-ink/45">Tenure</span>
        {tenures.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTenure(t);
              setBatchFilter("all");
            }}
            className={cn("font-serif text-3xl transition-colors", t === tenure ? "text-ink" : "text-ink/30 hover:text-ink/60")}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-ink/45">Batch</span>
        {["all", ...batchIds].map((id) => (
          <button
            key={id}
            onClick={() => setBatchFilter(id)}
            className={cn(
              "transition-colors",
              batchFilter === id ? "text-nss-red" : "text-ink/50 hover:text-ink",
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
              <h2 className="border-b border-ink/15 pb-2 font-display text-[15px] font-medium text-ink/50">{team}</h2>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
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
