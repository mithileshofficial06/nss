"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LiveTime } from "@/components/ui/live-clock";

const ease = [0.22, 1, 0.36, 1] as const;

const columns = [
  { title: "Explore", links: [["/events", "Events"], ["/leaderboard", "Leaderboard"], ["/team", "Team"], ["/gallery", "Gallery"]] },
  { title: "Portal", links: [["/register", "Register"], ["/login", "Sign in"], ["/admin/login", "Admin"]] },
];

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-ink/10 bg-white text-ink">
      <div className="mx-auto max-w-[1440px] px-5 pt-16 sm:px-8">
        <div className="grid gap-10 font-display text-[15px] md:grid-cols-[2fr_1fr_1fr_1.4fr]">
          <div className="flex items-start gap-4">
            <Image src="/brand/licet-logo.png" alt="LICET crest" width={48} height={48} className="h-12 w-12" />
            <p className="max-w-xs leading-snug text-ink/70">
              National Service Scheme unit of Loyola-ICAM College of Engineering and Technology, Chennai.
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-ink/45">{c.title}</p>
              <ul className="mt-3 space-y-1.5">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="font-medium transition-colors hover:text-nss-red">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-ink/45">Visit</p>
            <p className="mt-3 font-medium leading-snug">
              Loyola Campus, Nungambakkam,
              <br />
              Chennai 600034
            </p>
            <LiveTime className="mt-3 block text-ink/45 tabular-nums" />
          </div>
        </div>

        {/* Oversized sign-off, the emblem standing in for the registered mark */}
        <motion.div
          initial={{ y: "40%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease }}
          className="mt-16 flex items-start justify-center gap-[1vw] border-t border-ink/10 pb-[3vw] pt-6 xl:pb-10"
        >
          <p className="whitespace-nowrap font-serif text-[13.5vw] leading-[0.85] tracking-[-0.03em] xl:text-[12.5rem]">
            Not me, <em className="text-nss-red">but you</em>
          </p>
          <Image src="/brand/nss-logo.png" alt="" width={120} height={120} className="mt-[1vw] h-[6vw] w-[6vw] xl:h-24 xl:w-24" />
        </motion.div>

        <div className="flex flex-col justify-between gap-2 border-t border-ink/10 py-5 font-display text-[13px] text-ink/50 sm:flex-row">
          <span>© {new Date().getFullYear()} NSS Unit, LICET</span>
          <span>National Service Scheme · Ministry of Youth Affairs &amp; Sports, Government of India</span>
        </div>
      </div>
    </footer>
  );
}
