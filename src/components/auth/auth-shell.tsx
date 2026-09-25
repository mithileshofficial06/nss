"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LiveDate, LiveTime } from "@/components/ui/live-clock";

const ease = [0.22, 1, 0.36, 1] as const;

const COPY = {
  student: { kicker: "Student portal", title: ["Not me,", "but you."], photos: ["/images/events/beach-cleanup-2025.webp", "/images/orientation/orientation-6.webp"] },
  admin: { kicker: "Coordinators only", title: ["Admin", "console."], photos: ["/images/events/blood-donation-2026.webp", "/images/events/road-safety-rally-2026.webp"] },
} as const;

/**
 * Editorial frame for the login and register pages: ruled top bar, a poster headline with two
 * stacked, offset photographs on the left, and the form on the right.
 */
export function AuthShell({ children, variant = "student" }: { children: ReactNode; variant?: "student" | "admin" }) {
  const copy = COPY[variant];
  return (
    <div className="flex min-h-[100svh] flex-col bg-white px-5 sm:px-8">
      <header className="mx-auto w-full max-w-[1440px]">
        <div className="flex h-16 items-center justify-between font-display text-[15px] font-medium text-ink">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/brand/nss-logo.png" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-[16px] font-semibold">NSS LICET</span>
          </Link>
          <span className="hidden tabular-nums text-ink/60 sm:block">
            <LiveTime /> <LiveDate className="ml-1" />
          </span>
          <Link href="/" className="transition-colors hover:text-nss-red">
            ← Back to site
          </Link>
        </div>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease }} className="h-px origin-left bg-ink" />
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-12 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-14">
        <div className="hidden lg:block">
          <p className="flex items-center gap-2.5 font-display text-[15px] font-medium text-nss-red">
            <span className="h-3 w-3 bg-nss-red" /> {copy.kicker}
          </p>
          <h1 className="mt-4 font-poster text-[clamp(4rem,8vw,8.5rem)] uppercase leading-[0.88]">
            {copy.title.map((line, li) => (
              <span key={line} className="block overflow-hidden pb-[0.04em]">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.15 + li * 0.12, ease }}
                  className={`inline-block ${li === 0 ? "text-navy-600" : "text-nss-red"}`}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Stacked, offset photographs */}
          <div className="relative mt-10 h-[17rem] max-w-xl">
            {copy.photos.map((src, i) => (
              <motion.div
                key={src}
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 1.1, delay: 0.45 + i * 0.2, ease }}
                className={`absolute aspect-[4/3] w-[58%] overflow-hidden border-[6px] border-white bg-paper ${i === 0 ? "left-0 top-0" : "bottom-0 right-0"}`}
              >
                <Image src={src} alt="" fill sizes="340px" className="object-cover" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">{children}</div>
      </main>
    </div>
  );
}

export function Field({ label, icon, error, children }: { label: string; icon?: ReactNode; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/55">{label}</span>
      <span className="group relative flex items-center border border-ink/20 bg-white transition-colors focus-within:border-navy-600 focus-within:shadow-[inset_0_-2px_0_var(--color-navy-600)]">
        {icon && <span className="pl-3.5 text-ink/35 group-focus-within:text-navy-600">{icon}</span>}
        {children}
      </span>
      {error && <span className="mt-1 block text-xs font-semibold text-nss-red">{error}</span>}
    </label>
  );
}

export const inputCls = "w-full bg-transparent px-3.5 py-3 text-[15px] text-ink outline-none placeholder:text-ink/30";

/** Flat card used by the auth forms: tricolour strip on top, ruled border. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative border border-ink/15 bg-white">
      <div className="flex h-[4px]">
        <span className="flex-1 bg-navy-600" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-nss-red" />
      </div>
      <div className="p-7 sm:p-9">{children}</div>
    </div>
  );
}
