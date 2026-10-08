"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, Upload, X } from "lucide-react";
import { deleteStudent, importStudentsCsv, saveStudent, setStudentPassword, updateStudent, type ActionState } from "../../actions";
import { ActionForm, Card, ConfirmButton, LiveSwitch, SubmitButton, Toast, input, label } from "@/components/admin/ui";
import type { Batch, Profile } from "@/lib/types";
import { DEPARTMENTS, cn } from "@/lib/utils";

export type StudentRow = Profile & { points: number; attended: number };

/**
 * Right-hand panel on the Students page: add a volunteer record, or view and edit the selected one.
 * A record without an account is claimed when the student activates with the same register number.
 */
export function StudentPanel({ student, batches, onClose }: { student: StudentRow | null; batches: Batch[]; onClose: () => void }) {
  return (
    <Card
      title={student ? student.full_name : "Add a student"}
      description={student ? (student.email ? `Signed up as ${student.email}` : "Not signed up yet. They claim this record by activating with the same register number.") : "No account needed. They claim this record by activating with the same register number."}
      actions={
        <button onClick={onClose} className="text-ink/45 hover:text-ink" aria-label="Close">
          <X size={18} />
        </button>
      }
    >
      {student && (
        <dl className="mb-5 grid grid-cols-3 border-y border-ink/10 py-3 text-center">
          {[
            ["Points", student.points],
            ["Events", student.attended],
            ["Batch", batches.find((b) => b.id === student.batch_id)?.label ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-ink/45">{k}</dt>
              <dd className="font-display text-xl font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <ActionForm key={student ? `${student.id}-${student.updated_at}` : "new"} action={saveStudent} resetOnSuccess={!student} className="grid gap-3 sm:grid-cols-2">
        {student && <input type="hidden" name="id" value={student.id} />}
        <div className="sm:col-span-2">
          <Field name="full_name" l="Full name" d={student?.full_name} required />
        </div>
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
        <div className="sm:col-span-2">
          <SubmitButton className="w-full">{student ? "Save changes" : "Add student"}</SubmitButton>
        </div>
      </ActionForm>

      {student && <StudentAccess student={student} onRemoved={onClose} />}
    </Card>
  );
}

function StudentAccess({ student, onRemoved }: { student: StudentRow; onRemoved: () => void }) {
  const [toast, setToast] = useState<ActionState>(null);
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="mt-6 space-y-5 border-t border-ink/10 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">Reveal dashboard</p>
          <p className="text-xs text-ink/50">Always show their points and details, whatever the global blur.</p>
        </div>
        <LiveSwitch initial={student.reveal_details} action={(v) => updateStudent(student.id, { reveal_details: v })} />
      </div>

      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-ink">Role</span>
        <select
          defaultValue={student.role}
          onChange={(e) => {
            const role = e.target.value as "student" | "admin";
            if (role === "admin" && !confirm(`Give ${student.full_name} full admin access?`)) {
              e.target.value = student.role;
              return;
            }
            start(async () => setToast(await updateStudent(student.id, { role })));
          }}
          className={cn("border px-3 py-1.5 text-sm font-bold", student.role === "admin" ? "border-navy-600 bg-navy-100 text-navy-800" : "border-ink/15 bg-white")}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      {student.email && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await setStudentPassword(student.id, password);
              setToast(res);
              if (res?.ok) setPassword("");
            });
          }}
        >
          <span className={label}>Set new password</span>
          <p className="mb-2 text-xs text-ink/50">For a student who forgot theirs. Passwords can&apos;t be viewed, only replaced.</p>
          <div className="flex gap-2">
            <span className="relative flex-1">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" autoComplete="off" className={cn(input, "pl-9")} />
            </span>
            <button disabled={pending || password.length < 8} className="inline-flex items-center gap-2 bg-ink px-4 font-display text-[15px] font-semibold text-white transition-colors hover:bg-nss-red disabled:opacity-50">
              {pending && <Loader2 size={15} className="animate-spin" />} Set
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
        <span className="text-sm text-ink/60">Remove this student and their attendance and points</span>
        <ConfirmButton
          message={`Remove ${student.full_name}? Their attendance and points will be deleted too.`}
          onConfirm={async () => {
            await deleteStudent(student.id);
            onRemoved();
          }}
        />
      </div>
      <Toast state={toast} />
    </div>
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
