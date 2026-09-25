"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import { BrandLockup } from "./brand";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Navbar({ user }: { user: { name: string; role: "student" | "admin" } | null }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 320 && !open);
    setScrolled(y > 24);
  });

  // Every public page opens on a dark header, so the bar starts transparent with light text
  const solid = scrolled;
  const dashHref = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "transition-[background-color,border-color,box-shadow] duration-500",
            solid ? "border-b border-line bg-white/85 shadow-[0_10px_30px_-20px_rgba(8,12,43,.35)] backdrop-blur-xl" : "border-b border-white/10 bg-transparent",
          )}
        >
          <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link href="/" aria-label="NSS LICET home">
              <BrandLockup tone={solid ? "dark" : "light"} />
            </Link>

            <ul className="hidden items-center gap-8 lg:flex">
              {links.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        "group relative py-2 text-[14px] font-medium transition-colors",
                        solid ? "text-navy-900/70 hover:text-navy-900" : "text-white/75 hover:text-white",
                        active && (solid ? "text-navy-900" : "text-white"),
                      )}
                    >
                      {l.label}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-nss-red transition-transform duration-300",
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <Link href={dashHref} className="inline-flex items-center gap-2 rounded-full bg-nss-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-nss-red-dark">
                  {user.role === "admin" ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />}
                  {user.role === "admin" ? "Admin panel" : "My dashboard"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn("rounded-full px-4 py-2.5 text-sm font-semibold transition", solid ? "text-navy-900 hover:bg-navy-100" : "text-white hover:bg-white/10")}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-1.5 rounded-full bg-nss-red px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(225,29,42,.7)] transition hover:bg-nss-red-dark"
                  >
                    Join NSS
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </>
              )}
            </div>

            <button
              className={cn("grid h-11 w-11 place-items-center rounded-full lg:hidden", solid && !open ? "text-navy-900" : "text-white")}
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X /> : <Menu />}
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.2 } }}
            className="fixed inset-0 z-40 bg-navy-950 lg:hidden"
          >
            <div className="flex h-full flex-col justify-between px-6 pb-10 pt-28 text-white">
              <ul className="space-y-1">
                {links.map((l, i) => (
                  <li key={l.href} className="overflow-hidden">
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.5, delay: 0.05 * i, ease }}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex items-baseline justify-between border-b border-white/10 py-4 font-display text-3xl font-semibold tracking-tight"
                      >
                        {l.label}
                        <span className="text-xs font-medium text-white/40">0{i + 1}</span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex gap-3">
                {user ? (
                  <Link href={dashHref} onClick={() => setOpen(false)} className="flex-1 rounded-full bg-nss-red py-3.5 text-center font-semibold">
                    {user.role === "admin" ? "Admin panel" : "My dashboard"}
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-white/20 py-3.5 text-center font-semibold">
                      Sign in
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-nss-red py-3.5 text-center font-semibold">
                      Join NSS
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
