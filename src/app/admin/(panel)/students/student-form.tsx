"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { importStudentsCsv, saveStudent } from "../../actions";
import { ActionForm, Card, SubmitButton, input, label } from "@/components/admin/ui";
import type { Batch, Profile } from "@/lib/types";
import { DEPARTMENTS, cn } from "@/lib/utils";

/** Add a volunteer record or edit one. A record without an account is claimed when the student signs up with the same register number. */
export function StudentForm({ student, batches, onClose }: { student: Profile | null; batches: Batch[]; onClose: () => void }) {
  return (
    <Card
      title={student ? `Edit ${student.full_name}` : "Add a student"}
      description={student ? (student.email ? `Signed up as ${student.email}` : "No account yet. They claim this record by signing up with the same register number.") : "No account needed. They claim this record by signing up with the same register number."}
      actions={
        <button onClick={onClose} className="text-ink/45 hover:text-ink" aria-label="Close">
          <X size={18} />
        </button>
      }
      className="mb-6"
    >
      <ActionForm key={student?.id ?? "new"} action={saveStudent} resetOnSuccess={!student} onSuccess={() => student && onClose()} className="grid gap-3 md:grid-cols-3">
        {student && <input type="hidden" name="id" value={student.id} />}
        <Field name="full_name" l="Full name" d={student?.full_name} required />
        <Field name="register_no" l="Register no." d={student?.register_no} placeholder="311125104001" />
        <Field name="phone" l="Phone" d={student?.phone} />
        <label>
          <span className={label}>Department</span>
          <select name="department" defaultValue={student?.department ?? ""} className={input}>
            <option value="">—</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={label}>Batch</span>
          <select name="batch_id" defaultValue={student?.batch_id ?? ""} className={input}>
            <option value="">—</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-3">
          <SubmitButton>{student ? "Save changes" : "Add student"}</SubmitButton>
        </div>
      </ActionForm>
    </Card>
  );
}

export function StudentImport() {
  const [text, setText] = useState("");
  return (
    <Card
      title="Import students (CSV)"
      description={`register_no,full_name,department,batch,phone. Department is one of ${DEPARTMENTS.join(", ")}; batch is its label, e.g. 25-29. Existing register numbers are updated.`}
    >
      <ActionForm action={importStudentsCsv} className="space-y-3" onSuccess={() => setText("")}>
        <textarea
          name="csv"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"register_no,full_name,department,batch,phone\n311126104001,Priya S,CSE A,26-30,9876543210"}
          className={cn(input, "font-mono text-xs")}
        />
        <div className="flex gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 border border-ink/20 px-4 py-2.5 font-display text-[15px] font-semibold text-ink transition-colors hover:border-ink">
            <Upload size={16} /> Load .csv
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => setText((await e.target.files?.[0]?.text()) ?? "")} />
          </label>
          <SubmitButton className="flex-1">Import</SubmitButton>
        </div>
      </ActionForm>
    </Card>
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
