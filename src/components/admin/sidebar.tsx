"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardCheck, ExternalLink, Image as ImageIcon, LayoutGrid, LogOut, Menu, Settings, Trophy, Users, UsersRound, X } from "lucide-react";
import { NssWheel } from "@/components/ui/nss-wheel";
import { cn, initials } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/admin/points", label: "Leaderboard & points", icon: Trophy },
  { href: "/admin/team", label: "Office bearers", icon: UsersRound },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings & visibility", icon: Settings },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-ink">
          <NssWheel className="h-8 w-8" strokeWidth={4} />
        </span>
        <span>
          <span className="block font-display text-lg font-extrabold leading-none">NSS Admin</span>
          <span className="text-xs text-white/50">LICET portal</span>
        </span>
      </Link>
      <nav className="mt-10 flex-1 space-y-1">
        {nav.map((n) => {
          const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "text-ink" : "text-white/65 hover:bg-white/5 hover:text-white")}
            >
              {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-white" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <n.icon size={18} className="relative" />
              <span className="relative">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-white/10 pt-4">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white">
          <ExternalLink size={16} /> View site
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-nss-red text-xs font-bold">{initials(name)}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
          <form action="/auth/signout" method="post">
            <button className="text-white/50 hover:text-white" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-950 p-5 text-white lg:block">{content}</aside>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-navy-950 px-4 py-3 text-white lg:hidden">
        <span className="font-display font-extrabold">NSS Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} className="absolute inset-y-0 left-0 w-72 bg-navy-950 p-5 text-white">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white/60" aria-label="Close menu">
              <X />
            </button>
            {content}
          </motion.aside>
        </div>
      )}
    </>
  );
}
