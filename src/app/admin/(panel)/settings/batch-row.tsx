"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { deleteBatch, setBatchActive, updateBatch, type ActionState } from "../../actions";
import { ActionForm, LiveSwitch, SubmitButton, Toast, input } from "@/components/admin/ui";
import type { Batch } from "@/lib/types";
import { cn } from "@/lib/utils";

/** One batch: label and years, open-for-sign-up switch, inline edit, and delete (refused while students remain). */
export function BatchRow({ batch }: { batch: Batch }) {
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<ActionState>(null);
  const [pending, start] = useTransition();

  return (
    <li className="py-3">
      {editing ? (
        <ActionForm action={updateBatch} onSuccess={() => setEditing(false)} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={batch.id} />
          <input name="label" defaultValue={batch.label} className={cn(input, "w-24")} aria-label="Label" required />
          <input name="start_year" type="number" defaultValue={batch.start_year} className={cn(input, "w-24")} aria-label="Start year" required />
          <input name="end_year" type="number" defaultValue={batch.end_year} className={cn(input, "w-24")} aria-label="End year" required />
          <SubmitButton>Save</SubmitButton>
          <button type="button" onClick={() => setEditing(false)} className="px-2 py-2.5 font-display text-[14px] text-ink/55 hover:text-ink">
            Cancel
          </button>
        </ActionForm>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <span>
            <span className="font-poster text-lg text-ink">{batch.label}</span>
            <span className="ml-2 text-xs text-ink/50">
              {batch.start_year}–{batch.end_year}
            </span>
          </span>
          <span className="flex items-center gap-2 text-xs text-ink/50">
            Open for sign-up <LiveSwitch initial={batch.is_active} action={setBatchActive.bind(null, batch.id)} />
            <button onClick={() => setEditing(true)} className="grid h-9 w-9 place-items-center text-ink/40 transition-colors hover:bg-paper hover:text-ink" aria-label={`Edit batch ${batch.label}`}>
              <Pencil size={15} />
            </button>
            <button
              disabled={pending}
              onClick={() => confirm(`Delete batch ${batch.label}?`) && start(async () => setToast(await deleteBatch(batch.id)))}
              className="grid h-9 w-9 place-items-center text-ink/40 transition-colors hover:bg-nss-red hover:text-white disabled:opacity-50"
              aria-label={`Delete batch ${batch.label}`}
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </span>
        </div>
      )}
      <Toast state={toast} />
    </li>
  );
}
