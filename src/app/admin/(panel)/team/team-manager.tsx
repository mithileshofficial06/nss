"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import { deleteOfficeBearer, saveOfficeBearer } from "../../actions";
import { ActionForm, Card, ConfirmButton, ImageField, SubmitButton, input, label } from "@/components/admin/ui";
import type { Batch, OfficeBearer } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export function TeamManager({ people, batches }: { people: OfficeBearer[]; batches: Batch[] }) {
  const tenures = Array.from(new Set(people.map((p) => p.tenure))).sort().reverse();
  const [tenure, setTenure] = useState(tenures[0] ?? "");
  const [editing, setEditing] = useState<OfficeBearer | "new" | null>(null);
  const current = editing === "new" ? null : editing;
  const shown = people.filter((p) => p.tenure === tenure);
  const batchLabel = (id: string | null) => batches.find((b) => b.id === id)?.label ?? "—";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <Card
        actions={
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 rounded-xl bg-nss-red px-4 py-2.5 text-sm font-bold text-white">
            <Plus size={16} /> Add member
          </button>
        }
        title="Members"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {tenures.map((t) => (
            <button key={t} onClick={() => setTenure(t)} className={cn("rounded-full px-4 py-1.5 text-sm font-bold", t === tenure ? "bg-navy-900 text-white" : "bg-paper text-navy-900/60")}>
              {t}
            </button>
          ))}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {shown.map((p) => (
            <li key={p.id} className={cn("flex items-center gap-3 rounded-2xl border p-3", current?.id === p.id ? "border-navy-900" : "border-navy-900/10")}>
              <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-navy-900 font-display font-extrabold text-white">
                {p.photo_url ? <Image src={p.photo_url} alt="" fill sizes="56px" className="object-cover" /> : initials(p.name)}
              </div>
              <button onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-bold text-navy-900">{p.name}</p>
                <p className="truncate text-xs text-navy-900/50">
                  {p.position} · {p.department} · Batch {batchLabel(p.batch_id)}
                </p>
              </button>
              <ConfirmButton message={`Remove ${p.name}?`} onConfirm={() => deleteOfficeBearer(p.id)} />
            </li>
          ))}
        </ul>
      </Card>

      {editing && (
        <Card title={current ? `Edit ${current.name}` : "Add member"} className="xl:sticky xl:top-6 xl:self-start">
          <ActionForm key={current?.id ?? "new"} action={saveOfficeBearer} className="space-y-3" onSuccess={() => !current && setEditing(null)}>
            {current && <input type="hidden" name="id" value={current.id} />}
            <ImageField name="photo_url" folder="team" defaultValue={current?.photo_url} aspect="aspect-[3/4] max-w-[12rem]" />
            <Field name="name" l="Name" d={current?.name} required />
            <div className="grid grid-cols-2 gap-2">
              <Field name="position" l="Position" d={current?.position} placeholder="President" required />
              <label>
                <span className={label}>Team</span>
                <select name="team" defaultValue={current?.team ?? "Office Bearers"} className={input}>
                  <option>Office Bearers</option>
                  <option>Media Team</option>
                  <option>Coordinators</option>
                  <option>Faculty</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field name="tenure" l="Tenure" d={current?.tenure ?? tenure} placeholder="2026-27" required />
              <Field name="department" l="Year & dept" d={current?.department} placeholder="II CSE B" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className={label}>Batch</span>
                <select name="batch_id" defaultValue={current?.batch_id ?? ""} className={input}>
                  <option value="">—</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <Field name="sort_order" l="Order" d={String(current?.sort_order ?? 100)} type="number" />
            </div>
            <SubmitButton className="w-full">{current ? "Save" : "Add"}</SubmitButton>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}

function Field({ name, l, d, ...rest }: { name: string; l: string; d?: string | null } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={label}>{l}</span>
      <input name={name} defaultValue={d ?? ""} className={input} {...rest} />
    </label>
  );
}
