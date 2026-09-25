"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LayoutDashboard, LogIn, Menu, ShieldCheck, X } from "lucide-react";
import { NssWheel } from "@/components/ui/nss-wheel";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
];

export function Navbar({ user }: { user: { name: string; role: "student" | "admin" } | null }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240 && !open);
    setScrolled(y > 24);
  });

  const onDarkHero = pathname === "/" && !scrolled;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500",
            scrolled || pathname !== "/"
              ? "border border-navy-900/10 bg-paper/80 shadow-[0_8px_30px_-12px_rgba(10,18,53,.25)] backdrop-blur-xl"
              : "bg-transparent",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <span className={cn("grid h-10 w-10 place-items-center rounded-full", onDarkHero ? "bg-white/10 text-white" : "bg-navy-900 text-white")}>
              <NssWheel className="h-7 w-7 text-white transition-transform duration-700 group-hover:rotate-180" strokeWidth={4} />
            </span>
            <span className={cn("leading-none", onDarkHero ? "text-white" : "text-navy-900")}>
              <span className="block font-display text-lg font-extrabold tracking-tight">NSS LICET</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">Not me but you</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      onDarkHero ? "text-white/80 hover:text-white" : "text-navy-900/70 hover:text-navy-900",
                      active && (onDarkHero ? "text-white" : "text-navy-900"),
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className={cn("absolute inset-0 -z-10 rounded-full", onDarkHero ? "bg-white/15" : "bg-navy-900/8")}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 rounded-full bg-nss-red px-4 py-2 text-sm font-bold text-white transition hover:bg-nss-red-dark"
              >
                {user.role === "admin" ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />}
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
            ) : (
              <>
                <Link href="/register" className={cn("rounded-full px-4 py-2 text-sm font-semibold", onDarkHero ? "text-white/85 hover:text-white" : "text-navy-900/75 hover:text-navy-900")}>
                  Join NSS
                </Link>
                <Link href="/login" className="flex items-center gap-2 rounded-full bg-nss-red px-4 py-2 text-sm font-bold text-white transition hover:bg-nss-red-dark">
                  <LogIn size={16} /> Login
                </Link>
              </>
            )}
          </div>

          <button
            className={cn("grid h-10 w-10 place-items-center rounded-full md:hidden", onDarkHero ? "text-white" : "text-navy-900")}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-navy-950 px-6 pb-10 pt-28 text-white md:hidden"
          >
            <ul className="space-y-2">
              {links.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="font-display text-5xl font-extrabold tracking-tight hover:text-saffron">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="flex gap-3">
              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="flex-1 rounded-full bg-nss-red py-3 text-center font-bold">
                  {user.role === "admin" ? "Admin panel" : "My dashboard"}
                </Link>
              ) : (
                <>
                  <Link href="/register" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-white/25 py-3 text-center font-bold">
                    Join NSS
                  </Link>
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-nss-red py-3 text-center font-bold">
                    Login
                  </Link>
                </>
              )}
            </div>
            <NssWheel spin className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 text-white/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
