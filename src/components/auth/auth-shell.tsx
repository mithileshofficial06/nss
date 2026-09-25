"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { NssWheel } from "@/components/ui/nss-wheel";

const floaters = [
  { src: "/images/events/beach-cleanup-2025.webp", className: "left-[6%] top-[14%] rotate-[-10deg]", delay: 0 },
  { src: "/images/events/blood-donation-2026.webp", className: "right-[7%] top-[10%] rotate-[8deg]", delay: 1.2 },
  { src: "/images/orientation/orientation-6.webp", className: "left-[10%] bottom-[10%] rotate-[6deg]", delay: 0.6 },
  { src: "/images/events/blanket-donation-2025.webp", className: "right-[9%] bottom-[12%] rotate-[-7deg]", delay: 1.8 },
];

export function AuthShell({ children, variant = "student" }: { children: ReactNode; variant?: "student" | "admin" }) {
  return (
    <div className="grain relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-navy-950 px-4 py-24 text-white">
      <div className={`absolute left-1/4 top-1/4 h-[28rem] w-[28rem] rounded-full blur-[140px] ${variant === "admin" ? "bg-accent/20" : "bg-nss-red/30"}`} />
      <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-navy-600/40 blur-[120px]" />
      <NssWheel spin className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 text-white/[0.035]" strokeWidth={1.2} />

      {variant === "student" &&
        floaters.map((f) => (
          <motion.div
            key={f.src}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.55, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 + f.delay * 0.2 }}
            className={`absolute hidden h-44 w-36 animate-float overflow-hidden rounded-2xl border-4 border-white/80 shadow-2xl lg:block ${f.className}`}
            style={{ animationDelay: `${f.delay}s` }}
          >
            <Image src={f.src} alt="" fill sizes="144px" className="object-cover" />
          </motion.div>
        ))}

      <Link href="/" className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur hover:bg-white/20 hover:text-white">
        <ArrowLeft size={16} /> Back to site
      </Link>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

export function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-white/55">{label}</span>
      <span className="group relative flex items-center rounded-xl border border-white/12 bg-white/[0.06] transition focus-within:border-accent/70 focus-within:bg-white/[0.1] focus-within:shadow-[0_0_0_4px_rgba(169,177,255,.16)]">
        {icon && <span className="pl-3.5 text-white/45 group-focus-within:text-accent">{icon}</span>}
        {children}
      </span>
      {error && <span className="mt-1 block text-xs font-semibold text-ember">{error}</span>}
    </label>
  );
}

export const inputCls = "w-full bg-transparent px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 [&>option]:text-ink";
