import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { NssWheel } from "@/components/ui/nss-wheel";

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl">
              Not me,
              <br />
              <span className="text-nss-red">but you.</span>
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              The National Service Scheme unit of Loyola-ICAM College of Engineering and Technology — building character through
              community service since day one.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["/events", "Events"],
                ["/leaderboard", "Batch leaderboard"],
                ["/team", "Office bearers"],
                ["/gallery", "Gallery"],
                ["/register", "Register as a volunteer"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="group inline-flex items-center gap-1 text-white/75 transition hover:text-white">
                    {label}
                    <ArrowUpRight size={14} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Reach us</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-saffron" />
                Loyola Campus, Nungambakkam, Chennai — 600034
              </li>
              <li className="flex gap-2">
                <Mail size={16} className="mt-0.5 shrink-0 text-saffron" />
                NSS Unit, LICET
              </li>
            </ul>
            <Link href="/admin/login" className="mt-6 inline-block text-xs text-white/35 underline-offset-4 hover:text-white/70 hover:underline">
              Admin login
            </Link>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} NSS Unit, LICET. Built by volunteers.</p>
          <p>National Service Scheme · Ministry of Youth Affairs &amp; Sports</p>
        </div>
      </div>
      <NssWheel spin className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] text-white/[0.04]" />
    </footer>
  );
}
