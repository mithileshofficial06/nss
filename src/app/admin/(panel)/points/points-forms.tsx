"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import type { ActionState } from "../../actions";
import { ActionForm, SubmitButton, input, label } from "@/components/admin/ui";
import { cn, formatDate } from "@/lib/utils";

type Action = (s: ActionState, fd: FormData) => Promise<ActionState>;

export function AwardForm({ action, students, events }: { action: Action; students: { id: string; full_name: string; register_no: string | null }[]; events: { id: string; title: string; event_date: string }[] }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const shown = useMemo(() => students.filter((s) => s.full_name.toLowerCase().includes(q.toLowerCase()) || s.register_no?.toLowerCase().includes(q.toLowerCase())), [students, q]);

  return (
    <ActionForm action={action} className="space-y-3" resetOnSuccess onSuccess={() => setPicked(new Set())}>
      {Array.from(picked).map((id) => (
        <input key={id} type="hidden" name="student_id" value={id} />
      ))}
      <div>
        <span className={label}>Students ({picked.size} selected)</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className={cn(input, "mb-2 py-2")} />
        <div className="max-h-48 overflow-y-auto border border-ink/10">
          {shown.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-2 border-b border-ink/10 px-3 py-2 text-sm last:border-0 hover:bg-paper">
              <input
                type="checkbox"
                className="accent-nss-red"
                checked={picked.has(s.id)}
                onChange={() =>
                  setPicked((p) => {
                    const n = new Set(p);
                    if (n.has(s.id)) n.delete(s.id);
                    else n.add(s.id);
                    return n;
                  })
                }
              />
              <span className="flex-1 truncate">{s.full_name}</span>
              <span className="font-mono text-[10px] text-ink/40">{s.register_no}</span>
            </label>
          ))}
          {!shown.length && <p className="p-4 text-center text-xs text-ink/50">No students.</p>}
        </div>
      </div>
      <div className="grid grid-cols-[6rem_1fr] gap-2">
        <label>
          <span className={label}>Points</span>
          <input name="points" type="number" placeholder="+20" className={input} required />
        </label>
        <label>
          <span className={label}>Reason</span>
          <input name="reason" placeholder="Coordinated beach clean-up" className={input} required />
        </label>
      </div>
      <label className="block">
        <span className={label}>Linked event (optional)</span>
        <select name="event_id" className={input} defaultValue="">
          <option value="">—</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {formatDate(e.event_date)} — {e.title}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton className="w-full">Save points</SubmitButton>
      <p className="text-xs text-ink/45">Use a negative number to deduct.</p>
    </ActionForm>
  );
}

export function CsvImport({ action }: { action: Action }) {
  const [text, setText] = useState("");
  return (
    <ActionForm action={action} className="space-y-3" onSuccess={() => setText("")}>
      <textarea
        name="csv"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"register_no,points,reason\n312424104001,25,Beach clean-up\n312424104002,10,NSS Day quiz"}
        className={cn(input, "font-mono text-xs")}
      />
      <div className="flex gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink hover:bg-paper">
          <Upload size={16} /> Load .csv
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => setText((await e.target.files?.[0]?.text()) ?? "")} />
        </label>
        <SubmitButton className="flex-1">Import</SubmitButton>
      </div>
    </ActionForm>
  );
}
