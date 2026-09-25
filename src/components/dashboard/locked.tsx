"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

/**
 * Wraps a dashboard section. When locked, the children passed in are dummy placeholders
 * (the server never sends real data for a locked section), shown blurred behind a lock badge.
 */
export function Lockable({ locked, children, label }: { locked: boolean; children: ReactNode; label: string }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none blur-md saturate-50">
        {children}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
      >
        <motion.span
          className="grid h-14 w-14 place-items-center rounded-2xl bg-navy-900 text-white shadow-xl"
          animate={{ rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Lock size={22} />
        </motion.span>
        <p className="font-display text-lg font-bold text-navy-900">{label} locked</p>
        <p className="max-w-[16rem] text-xs text-navy-900/60">The NSS team will reveal this once it&apos;s verified.</p>
      </motion.div>
    </div>
  );
}
