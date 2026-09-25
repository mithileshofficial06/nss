"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Field, inputCls } from "./auth-shell";
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
    <motion.div animate={shake} initial={{ opacity: 0, y: 40, rotateX: 20 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
      <TiltCard max={7} className="rounded-[2rem]">
        <div className="spin-border relative overflow-hidden rounded-[2rem] p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)] sm:p-10">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.06] to-transparent" />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-16 text-center">
                <motion.div initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                  <CheckCircle2 size={72} className="text-saffron" />
                </motion.div>
                <p className="mt-5 font-display text-3xl font-extrabold">Welcome back!</p>
                <p className="mt-1 text-sm text-white/60">Taking you to your {isAdmin ? "admin panel" : "dashboard"}…</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0, y: -20 }} className="relative space-y-5">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className={`grid h-20 w-20 place-items-center rounded-full ${isAdmin ? "bg-saffron text-ink" : "bg-nss-red text-white"} shadow-lg`}
                    animate={{ rotate: password.length * 45 + (loading ? 720 : 0) }}
                    transition={{ type: "spring", stiffness: 90, damping: 14 }}
                  >
                    {isAdmin ? <ShieldCheck size={34} /> : <NssWheel className="h-14 w-14" strokeWidth={4} />}
                  </motion.div>
                  <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight">{isAdmin ? "Admin console" : "Volunteer login"}</h1>
                  <p className="mt-1 text-sm text-white/55">{isAdmin ? "Restricted to NSS coordinators" : "Sign in to see your NSS journey"}</p>
                </div>

                {notice && <p className="rounded-xl border border-saffron/30 bg-saffron/10 px-4 py-3 text-sm text-saffron">{notice}</p>}

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
                  <button type="button" onClick={() => setShow((s) => !s)} className="pr-3.5 text-white/45 hover:text-white" aria-label={show ? "Hide password" : "Show password"}>
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </Field>

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm font-semibold text-ember" role="alert">
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  disabled={loading}
                  className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 font-bold transition disabled:opacity-70 ${isAdmin ? "bg-saffron text-ink" : "bg-nss-red text-white"}`}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,.35)_50%,transparent_75%)] bg-[length:200%_100%] opacity-0 transition group-hover:animate-shimmer group-hover:opacity-100" />
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign in <ArrowRight size={18} className="transition group-hover:translate-x-1" /></>}
                </button>

                {!isAdmin && (
                  <p className="text-center text-sm text-white/55">
                    First time here?{" "}
                    <Link href="/register" className="font-bold text-saffron hover:underline">
                      Create your account
                    </Link>
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </TiltCard>
    </motion.div>
  );
}
