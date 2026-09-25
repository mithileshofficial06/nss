"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { AuthCard, Field, inputCls } from "./auth-shell";
import { NssWheel } from "@/components/ui/nss-wheel";
import { TiltCard } from "@/components/ui/motion";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginCard({ mode, next, notice }: { mode: "student" | "admin"; next?: string; notice?: string }) {
  const router = useRouter();
  const shake = useAnimationControls();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fail = (msg: string) => {
    setError(msg);
    setLoading(false);
    shake.start({ x: [0, -14, 12, -8, 6, 0], transition: { duration: 0.5 } });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) return fail("Supabase is not connected yet. Add your keys to .env.local.");
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      return fail(error?.message === "Email not confirmed" ? "Please confirm your email first — check your inbox." : "Incorrect email or password.");
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (mode === "admin" && profile?.role !== "admin") {
      await supabase.auth.signOut();
      return fail("This account doesn't have admin access.");
    }
    setSuccess(true);
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : profile?.role === "admin" ? "/admin" : "/dashboard";
    setTimeout(() => {
      router.push(dest);
      router.refresh();
    }, 900);
  }

  const isAdmin = mode === "admin";

  return (
    <motion.div animate={shake} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
      <TiltCard max={4} glare={false}>
        <AuthCard>
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-14 text-center">
                <motion.div initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                  <CheckCircle2 size={64} className="text-navy-600" strokeWidth={1.5} />
                </motion.div>
                <p className="mt-5 font-serif text-4xl text-ink">
                  Welcome <em className="text-nss-red">back.</em>
                </p>
                <p className="mt-2 font-display text-[15px] text-ink/55">Taking you to your {isAdmin ? "admin panel" : "dashboard"}…</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-nss-red">{isAdmin ? "Restricted" : "Volunteers"}</p>
                    <h2 className="mt-1 font-serif text-[2.6rem] leading-none text-ink">{isAdmin ? "Admin login" : "Log in"}</h2>
                    <p className="mt-2 font-display text-[15px] text-ink/55">{isAdmin ? "For NSS coordinators and office bearers." : "See your NSS activities, points and attendance."}</p>
                  </div>
                  {/* The wheel turns a spoke for every character typed, and spins while signing in */}
                  <motion.div
                    className={`shrink-0 ${isAdmin ? "text-nss-red" : "text-navy-600"}`}
                    animate={{ rotate: password.length * 45 + (loading ? 720 : 0) }}
                    transition={{ type: "spring", stiffness: 90, damping: 14 }}
                  >
                    {isAdmin ? <ShieldCheck size={52} strokeWidth={1.5} /> : <NssWheel className="h-14 w-14" strokeWidth={4} />}
                  </motion.div>
                </div>

                <div className="h-px bg-ink/15" />

                {notice && <p className="border-l-[3px] border-navy-600 bg-navy-100 px-4 py-3 text-sm text-navy-800">{notice}</p>}

                <Field label="Email" icon={<Mail size={17} />}>
                  <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@licet.ac.in" className={inputCls} />
                </Field>
                <Field label="Password" icon={<Lock size={17} />}>
                  <input
                    type={show ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputCls}
                  />
                  <button type="button" onClick={() => setShow((s) => !s)} className="pr-3.5 text-ink/35 hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </Field>

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm font-semibold text-nss-red" role="alert">
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-ink py-3.5 font-display text-[17px] font-semibold text-white transition-colors disabled:opacity-70"
                >
                  {/* Red fill sweeps up from the bottom on hover */}
                  <span className={`absolute inset-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0 ${isAdmin ? "bg-navy-600" : "bg-nss-red"}`} />
                  <span className="relative flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Log in <ArrowRight size={18} className="transition group-hover:translate-x-1" /></>}
                  </span>
                </button>

                {!isAdmin && (
                  <p className="text-center font-display text-[15px] text-ink/60">
                    First time here?{" "}
                    <Link href="/register" className="font-semibold text-nss-red underline-offset-4 hover:underline">
                      Create your account
                    </Link>
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </AuthCard>
      </TiltCard>
    </motion.div>
  );
}
