"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Hash, Loader2, Lock, Mail } from "lucide-react";
import { AuthCard, Field, inputCls } from "./auth-shell";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

type Found = { full_name: string; department: string | null; batch: string | null };

/** Friendlier wording for the sign-up errors students can actually hit. */
export function signUpMessage(message: string) {
  if (/rate limit/i.test(message)) return "Too many sign-ups right now. Please try again in an hour, or ask the NSS team.";
  if (/sending|smtp|not authorized|email address/i.test(message)) return "We couldn't send the confirmation email. Please tell the NSS team so they can sort it out.";
  if (/already registered|already been registered/i.test(message)) return "That email already has an account. Log in instead.";
  return message;
}

/**
 * For volunteers the NSS team has already added (from the registers): find the record by
 * register number, then set an email and password. Signing up with that register number
 * attaches the new login to the existing record, keeping its attendance and points.
 */
export function ActivateForm() {
  const router = useRouter();
  const [reg, setReg] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function find(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) return setError("Supabase is not connected yet.");
    if (!reg.trim()) return setError("Enter your register number");
    setLoading(true);
    setError(null);
    const { data, error } = await createClient().rpc("lookup_volunteer", { p_register_no: reg });
    setLoading(false);
    if (error) return setError(error.message);
    const row = (data as Found[] | null)?.[0];
    if (!row) return setError("No record waiting for that register number. It may already be activated (try logging in), or you can sign up as a new volunteer.");
    setFound(row);
  }

  async function activate(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email");
    if (password.length < 8) return setError("Password needs at least 8 characters");
    if (password !== confirm) return setError("Passwords don't match");
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Only the register number: the database keeps the name, department and batch already on file
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { register_no: reg.trim().toUpperCase() } },
    });
    if (error) {
      setLoading(false);
      return setError(signUpMessage(error.message));
    }
    if (data.session) await supabase.auth.signOut();
    router.push("/login?activated=1");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
      <AuthCard>
        <p className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-nss-red">Already an NSS volunteer</p>
        <h2 className="mt-1 font-serif text-[2.6rem] leading-none text-ink">Activate</h2>
        <p className="mt-2 font-display text-[15px] text-ink/55">Your attendance and points are already here. Find your record, then choose a login.</p>

        <div className="relative mt-7 min-h-[18rem]">
          <AnimatePresence mode="wait">
            {!found ? (
              <motion.form key="find" onSubmit={find} method="post" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-4">
                <Field label="Register number" icon={<Hash size={17} />}>
                  <input value={reg} onChange={(e) => setReg(e.target.value)} placeholder="e.g. 311125104001" autoComplete="off" className={cn(inputCls, "uppercase")} />
                </Field>
                <Error text={error} />
                <button disabled={loading} className="group flex w-full items-center justify-center gap-2 bg-ink py-3.5 font-display text-[17px] font-semibold text-white transition-colors hover:bg-nss-red disabled:opacity-70">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Find my record <ArrowRight size={18} className="transition group-hover:translate-x-1" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form key="login" onSubmit={activate} method="post" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-4">
                <div className="border-l-[3px] border-navy-600 bg-navy-100 px-4 py-3">
                  <p className="font-serif text-[1.6rem] leading-tight text-ink">{found.full_name}</p>
                  <p className="font-display text-[14px] text-navy-800">
                    {[reg.trim().toUpperCase(), found.department, found.batch && `Batch ${found.batch}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Field label="Email" icon={<Mail size={17} />}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@licet.ac.in" className={inputCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Password" icon={<Lock size={17} />}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="8+ characters" className={inputCls} />
                  </Field>
                  <Field label="Confirm" icon={<Lock size={17} />}>
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Repeat" className={inputCls} />
                  </Field>
                </div>
                <Error text={error} />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFound(null);
                      setError(null);
                    }}
                    className="flex items-center gap-2 border border-ink/20 px-5 py-3.5 font-display text-[16px] font-semibold text-ink transition-colors hover:border-ink"
                  >
                    <ArrowLeft size={16} /> Not me
                  </button>
                  <button disabled={loading} className="flex flex-1 items-center justify-center gap-2 bg-nss-red py-3.5 font-display text-[17px] font-semibold text-white transition-colors hover:bg-navy-600 disabled:opacity-70">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Activate account <Check size={18} /></>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

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

function Error({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p role="alert" className="text-sm font-semibold text-nss-red">
      {text}
    </p>
  );
}
