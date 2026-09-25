import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { BrandLockup } from "./brand";

const explore = [
  ["/events", "Events"],
  ["/leaderboard", "Batch leaderboard"],
  ["/team", "Office bearers"],
  ["/gallery", "Gallery"],
];
const portal = [
  ["/register", "Register as a volunteer"],
  ["/login", "Volunteer sign in"],
  ["/admin/login", "Admin console"],
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nss-red/70 to-transparent" />
      <div aria-hidden className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-navy-600/30 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLockup tone="light" />
            <p className="mt-6 max-w-sm font-serif text-3xl leading-tight text-white/90">
              “Not me, <em className="text-ember">but you.</em>”
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              The NSS unit of Loyola-ICAM College of Engineering and Technology — developing character through community service.
            </p>
          </div>
          <FooterCol title="Explore" items={explore} />
          <FooterCol title="Portal" items={portal} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Visit</p>
            <p className="mt-4 flex gap-2.5 text-sm leading-relaxed text-white/70">
              <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
              Loyola-ICAM College of Engineering and Technology, Loyola Campus, Nungambakkam, Chennai — 600034
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NSS Unit, LICET. All rights reserved.</p>
          <p>National Service Scheme · Ministry of Youth Affairs &amp; Sports, Government of India</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[][] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="group inline-flex items-center gap-1 text-white/70 transition hover:text-white">
              {label}
              <ArrowUpRight size={14} className="-translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
