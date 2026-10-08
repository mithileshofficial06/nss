"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Check, Hash, Loader2, Lock, Mail, User } from "lucide-react";
import { AuthCard, Field, inputCls } from "./auth-shell";
import { activateVolunteer } from "@/app/(auth)/register/actions";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS, cn } from "@/lib/utils";

/**
 * Logs a just-created account in and opens the dashboard. If the login itself is refused (e.g. a
 * rate limit), the account still exists, so fall back to the login page with a notice.
 */
export async function signInAfterSignUp(email: string, password: string, notice: "activated" | "registered") {
  const { error } = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  // Full page load so the first request carries the new session cookie
  window.location.assign(error ? `/login?${notice}=1` : "/dashboard");
}

/**
 * For volunteers the NSS team has already added (from the registers): register number,
 * department and name must match their record. The new login is then attached to it,
 * keeping its attendance and points.
 */
export function ActivateForm() {
  const [f, setF] = useState({ register_no: "", department: "", full_name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function activate(e: React.FormEvent) {
    e.preventDefault();
    if (!f.register_no.trim()) return setError("Enter your register number");
    if (!f.department) return setError("Pick your department");
    if (f.full_name.trim().length < 2) return setError("Enter your name");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Enter a valid email");
    if (f.password.length < 8) return setError("Password needs at least 8 characters");
    if (f.password !== f.confirm) return setError("Passwords don't match");
    setLoading(true);
    setError(null);
    const res = await activateVolunteer(f).catch(() => ({ ok: false as const, message: "Something went wrong. Please try again." }));
    if (!res.ok) {
      setLoading(false);
      return setError(res.message);
    }
    await signInAfterSignUp(f.email, f.password, "activated");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
      <AuthCard>
        <p className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-nss-red">Already an NSS volunteer</p>
        <h2 className="mt-1 font-serif text-[2.6rem] leading-none text-ink">Activate</h2>
        <p className="mt-2 font-display text-[15px] text-ink/55">Your attendance and points are already here. Enter your details as in college records, then choose a login.</p>

        <form onSubmit={activate} method="post" className="mt-7 space-y-4">
          <Field label="Register number" icon={<Hash size={17} />}>
            <input value={f.register_no} onChange={set("register_no")} placeholder="e.g. 311125104001" autoComplete="off" className={cn(inputCls, "uppercase")} />
          </Field>
          <Field label="Department" icon={<BookOpen size={17} />}>
            <select value={f.department} onChange={set("department")} className={inputCls}>
              <option value="">Select</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Name" icon={<User size={17} />}>
            <input value={f.full_name} onChange={set("full_name")} autoComplete="name" placeholder="As in college records" className={inputCls} />
          </Field>

          <div className="h-px bg-ink/15" />

          <Field label="Email" icon={<Mail size={17} />}>
            <input type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@licet.ac.in" className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" icon={<Lock size={17} />}>
              <input type="password" value={f.password} onChange={set("password")} autoComplete="new-password" placeholder="8+ characters" className={inputCls} />
            </Field>
            <Field label="Confirm" icon={<Lock size={17} />}>
              <input type="password" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" placeholder="Repeat" className={inputCls} />
            </Field>
          </div>

          {error && (
            <p role="alert" className="text-sm font-semibold text-nss-red">
              {error}
            </p>
          )}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 bg-nss-red py-3.5 font-display text-[17px] font-semibold text-white transition-colors hover:bg-navy-600 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Activate account <Check size={18} /></>}
          </button>
        </form>

        <p className="mt-6 text-center font-display text-[15px] text-ink/60">
          Already activated?{" "}
          <Link href="/login" className="font-semibold text-nss-red underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </AuthCard>
    </motion.div>
  );
}
