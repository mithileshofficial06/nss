"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LiveDate, LiveTime } from "@/components/ui/live-clock";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Editorial top bar: brand, live Chennai clock, links spread across a grid.
 * On the landing page the masthead carries the nav, so this bar only slides in after scrolling past it.
 */
export function Navbar({ user }: { user: { name: string; role: "student" | "admin" } | null }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const [pastMasthead, setPastMasthead] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setPastMasthead(y > 620));

  const visible = !isHome || pastMasthead || open;
  const account = user
    ? { href: user.role === "admin" ? "/admin" : "/dashboard", label: user.role === "admin" ? "Admin" : "Dashboard" }
    : { href: "/register", label: "Join NSS" };

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: visible ? 0 : -80 }}
        transition={{ duration: 0.5, ease }}
        className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-white/90 backdrop-blur-md"
      >
        <nav className="mx-auto grid h-14 max-w-[1440px] grid-cols-[1fr_auto] items-center gap-6 px-5 font-display text-[15px] font-medium text-ink sm:px-8 lg:grid-cols-[1.4fr_1.4fr_repeat(4,1fr)_auto]">
          <Link href="/" className="flex items-center gap-2.5" aria-label="NSS LICET home">
            <Image src="/brand/nss-logo.png" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-[16px] font-semibold tracking-tight">NSS LICET</span>
          </Link>
          <span className="hidden text-ink/70 tabular-nums lg:block">
            <LiveTime /> <LiveDate className="ml-1" />
          </span>
          {NAV_LINKS.slice(1).map((l) => (
            <NavItem key={l.href} href={l.href} label={l.label} active={pathname.startsWith(l.href)} className="hidden lg:inline-flex" />
          ))}
          <div className="flex items-center justify-end gap-5">
            {!user && <NavItem href="/login" label="Sign in" active={pathname === "/login"} className="hidden lg:inline-flex" />}
            <Link href={account.href} className="hidden items-center gap-1.5 text-nss-red transition-colors hover:text-navy-600 lg:inline-flex">
              <span className="h-2 w-2 bg-nss-red" /> {account.label}
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="lg:hidden" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-white px-5 pb-8 pt-20 lg:hidden"
          >
            <ul>
              {NAV_LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-ink/10">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.55, delay: 0.15 + i * 0.05, ease }}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-3 font-serif text-5xl text-ink">
                      {l.label}
                      <span className="font-display text-sm text-ink/40">0{i + 1}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between font-display text-[15px]">
              {!user && (
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              )}
              <Link href={account.href} onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-nss-red">
                <span className="h-2 w-2 bg-nss-red" /> {account.label}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Link with a strike-through style underline that sweeps in on hover. */
export function NavItem({ href, label, active, className }: { href: string; label: string; active?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("group relative w-fit items-center transition-colors hover:text-nss-red", active && "text-nss-red", className)}>
      {label}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-px w-full origin-right bg-current transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}
