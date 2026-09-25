"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LiveDate, LiveTime } from "@/components/ui/live-clock";
import { cn, initials } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/points", label: "Leaderboard & points" },
  { href: "/admin/team", label: "Office bearers" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/settings", label: "Settings & visibility" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Editorial index-style sidebar: numbered serif entries on white, a red marker on the active one. */
export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3">
        <Image src="/brand/nss-logo.png" alt="" width={40} height={40} className="h-10 w-10" />
        <span>
          <span className="block font-poster text-[22px] uppercase leading-none">
            <span className="text-navy-600">NSS</span> <span className="text-nss-red">Admin</span>
          </span>
          <span className="font-display text-[13px] text-ink/50">LICET portal</span>
        </span>
      </Link>
      <p className="mt-6 border-y border-ink/15 py-2 font-display text-[13px] tabular-nums text-ink/55">
        <LiveTime /> <LiveDate className="ml-1" />
      </p>

      <nav className="mt-4 flex-1">
        <ul>
          {nav.map((n, i) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <li key={n.href} className="border-b border-ink/10">
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cn("group relative flex items-baseline gap-3 py-2.5 font-serif text-[21px] leading-tight transition-colors", active ? "text-nss-red" : "text-ink hover:text-nss-red")}
                >
                  <span className={cn("w-5 font-display text-[12px] font-medium", active ? "text-nss-red" : "text-ink/35")}>0{i + 1}</span>
                  {n.label}
                  {active && <motion.span layoutId="admin-nav" className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 bg-nss-red" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-ink pt-4 font-display text-[15px]">
        <Link href="/" className="block text-ink/60 transition-colors hover:text-nss-red">
          View site ↗
        </Link>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-navy-600 font-poster text-[15px] text-white">{initials(name)}</span>
          <span className="min-w-0 flex-1 truncate font-semibold text-ink">{name}</span>
          <form action="/auth/signout" method="post">
            <button className="text-[14px] font-medium text-ink/55 transition-colors hover:text-nss-red">Sign out</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-y-auto border-r border-ink/15 bg-white px-6 py-6 lg:block">{content}</aside>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink/15 bg-white/90 px-5 font-display backdrop-blur-md lg:hidden">
        <span className="font-poster text-[20px] uppercase">
          <span className="text-navy-600">NSS</span> <span className="text-nss-red">Admin</span>
        </span>
        <button onClick={() => setOpen(true)} className="text-[15px] font-medium" aria-label="Open menu">
          Menu
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease }}
            className="fixed inset-0 z-50 overflow-y-auto bg-white px-6 py-6 lg:hidden"
          >
            <button onClick={() => setOpen(false)} className="absolute right-5 top-5 font-display text-[15px] font-medium" aria-label="Close menu">
              Close
            </button>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
