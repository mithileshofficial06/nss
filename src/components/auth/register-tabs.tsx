"use client";

import { useState } from "react";
import { ActivateForm } from "./activate-form";
import { RegisterForm } from "./register-form";
import type { Batch } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "activate", label: "Already a volunteer" },
  { key: "new", label: "New volunteer" },
] as const;

/** Sign-up page: activate an existing record (the NSS team added it) or register from scratch. */
export function RegisterTabs({ batches, initial }: { batches: Batch[]; initial: "activate" | "new" }) {
  const [tab, setTab] = useState<"activate" | "new">(initial);
  return (
    <div>
      <div role="tablist" className="mb-4 grid grid-cols-2 border border-ink/15 font-display text-[15px] font-semibold">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn("py-2.5 transition-colors", tab === t.key ? "bg-ink text-white" : "text-ink/60 hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "activate" ? <ActivateForm /> : <RegisterForm batches={batches} />}
    </div>
  );
}
