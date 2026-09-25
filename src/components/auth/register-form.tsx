"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check, Hash, Loader2, Lock, Mail, Phone, User, Users } from "lucide-react";
import { Field, inputCls } from "./auth-shell";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Batch } from "@/lib/types";
import { DEPARTMENTS, cn } from "@/lib/utils";

type Form = {
  full_name: string;
  email: string;
  password: string;
  confirm: string;
  register_no: string;
  department: string;
  section: string;
  batch_id: string;
  phone: string;
};

const steps = ["Account", "College", "Review"];

export function RegisterForm({ batches }: { batches: Batch[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Form | "form", string>>>({});
  const [f, setF] = useState<Form>({ full_name: "", email: "", password: "", confirm: "", register_no: "", department: "", section: "", batch_id: "", phone: "" });
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  function validate(s: number) {
    const e: typeof errors = {};
    if (s === 0) {
      if (f.full_name.trim().length < 2) e.full_name = "Enter your full name";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
      if (f.password.length < 8) e.password = "At least 8 characters";
      if (f.confirm !== f.password) e.confirm = "Passwords don't match";
    }
    if (s === 1) {
      if (!f.register_no.trim()) e.register_no = "Register number is required";
      if (!f.department) e.department = "Pick your department";
      if (!f.batch_id) e.batch_id = "Pick your batch";
      if (f.phone && !/^[0-9+\-\s]{10,15}$/.test(f.phone)) e.phone = "Enter a valid phone number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const go = (d: number) => {
    if (d > 0 && !validate(step)) return;
    setDir(d);
    setStep((s) => s + d);
  };

  async function submit() {
    if (!isSupabaseConfigured) return setErrors({ form: "Supabase is not connected yet. Add your keys to .env.local." });
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: f.email.trim(),
      password: f.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: f.full_name.trim(),
          register_no: f.register_no.trim().toUpperCase(),
          department: f.department,
          section: f.section.trim(),
          batch_id: f.batch_id,
          phone: f.phone.trim(),
        },
      },
    });
    if (error) {
      setLoading(false);
      const msg = /register_no|duplicate/i.test(error.message) ? "That register number is already registered." : error.message;
      return setErrors({ form: msg });
    }
    // Registration always ends at the login screen
    if (data.session) await supabase.auth.signOut();
    router.push("/login?registered=1");
  }

  const batchLabel = batches.find((b) => b.id === f.batch_id)?.label;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
      <div className="spin-border overflow-hidden rounded-[2rem] p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)] sm:p-10">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Join NSS LICET</h1>
        <p className="mt-1 text-sm text-white/55">Create your volunteer account — takes a minute.</p>

        {/* stepper */}
        <ol className="mt-7 flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-all duration-500",
                  i < step ? "bg-saffron text-ink" : i === step ? "bg-nss-red text-white ring-4 ring-nss-red/25" : "bg-white/10 text-white/50",
                )}
              >
                {i < step ? <Check size={15} /> : i + 1}
              </span>
              <span className={cn("hidden text-xs font-bold sm:block", i === step ? "text-white" : "text-white/45")}>{s}</span>
              {i < steps.length - 1 && (
                <span className="relative h-0.5 flex-1 overflow-hidden rounded bg-white/10">
                  <motion.span className="absolute inset-y-0 left-0 bg-saffron" animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="relative mt-7 min-h-[22rem]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <Field label="Full name" icon={<User size={17} />} error={errors.full_name}>
                    <input value={f.full_name} onChange={set("full_name")} autoComplete="name" placeholder="As in college records" className={inputCls} />
                  </Field>
                  <Field label="Email" icon={<Mail size={17} />} error={errors.email}>
                    <input type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@licet.ac.in" className={inputCls} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Password" icon={<Lock size={17} />} error={errors.password}>
                      <input type="password" value={f.password} onChange={set("password")} autoComplete="new-password" placeholder="8+ characters" className={inputCls} />
                    </Field>
                    <Field label="Confirm" icon={<Lock size={17} />} error={errors.confirm}>
                      <input type="password" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" placeholder="Repeat" className={inputCls} />
                    </Field>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <Field label="Register number" icon={<Hash size={17} />} error={errors.register_no}>
                    <input value={f.register_no} onChange={set("register_no")} placeholder="e.g. 312424104001" className={cn(inputCls, "uppercase")} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Department" icon={<BookOpen size={17} />} error={errors.department}>
                      <select value={f.department} onChange={set("department")} className={inputCls}>
                        <option value="">Select</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Section" icon={<Users size={17} />}>
                      <input value={f.section} onChange={set("section")} placeholder="A / B (optional)" className={inputCls} />
                    </Field>
                  </div>
                  <div>
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-white/55">Batch</span>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {batches.map((b) => (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => setF((p) => ({ ...p, batch_id: b.id }))}
                          className={cn(
                            "rounded-xl border py-2.5 text-sm font-bold transition",
                            f.batch_id === b.id ? "border-saffron bg-saffron text-ink" : "border-white/12 bg-white/[0.05] text-white/70 hover:border-white/30",
                          )}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                    {errors.batch_id && <span className="mt-1 block text-xs font-semibold text-ember">{errors.batch_id}</span>}
                  </div>
                  <Field label="Phone" icon={<Phone size={17} />} error={errors.phone}>
                    <input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="Optional" className={inputCls} />
                  </Field>
                </>
              )}
              {step === 2 && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm">
                  {[
                    ["Name", f.full_name],
                    ["Email", f.email],
                    ["Register no.", f.register_no.toUpperCase()],
                    ["Department", `${f.department}${f.section ? ` · ${f.section}` : ""}`],
                    ["Batch", batchLabel],
                    ["Phone", f.phone || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-white/5 py-2 last:border-0">
                      <span className="text-white/50">{k}</span>
                      <span className="text-right font-semibold">{v}</span>
                    </div>
                  ))}
                  <p className="pt-2 text-xs text-white/45">Your attendance, activities and points will appear on your dashboard once the NSS team publishes them.</p>
                </div>
              )}
              {errors.form && (
                <p role="alert" className="text-sm font-semibold text-ember">
                  {errors.form}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => go(-1)} className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold text-white/80 hover:bg-white/5">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" onClick={() => go(1)} className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-nss-red py-3.5 font-bold hover:bg-ember">
              Continue <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
          ) : (
            <button type="button" disabled={loading} onClick={submit} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-saffron py-3.5 font-bold text-ink disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create account <Check size={18} /></>}
            </button>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-white/55">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-saffron hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
