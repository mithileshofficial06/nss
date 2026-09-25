"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "@/components/site/navbar";
import { LiveDate, LiveTime } from "@/components/ui/live-clock";

const ease = [0.22, 1, 0.36, 1] as const;

type NextEvent = { title: string; slug: string; date: string } | null;

/** Magazine-style masthead: colour bar, oversized serif wordmark with the NSS emblem as its mark, ruled nav. */
export function Masthead({ nextEvent, signedIn }: { nextEvent: NextEvent; signedIn: { href: string; label: string } | null }) {
  const letters = "NSS LICET".split("");
  return (
    <header className="bg-white px-5 pt-5 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Emblem colours as a thin bar, like a magazine's issue strip */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease }} className="mx-auto flex w-24 overflow-hidden">
          <span className="h-[3px] flex-1 bg-navy-600" />
          <span className="h-[3px] flex-1 bg-white" />
          <span className="h-[3px] flex-1 bg-nss-red" />
        </motion.div>

        <h1 className="relative mx-auto mt-4 flex w-fit items-start justify-center font-serif text-[clamp(4.5rem,17vw,16rem)] leading-[0.82] tracking-[-0.035em] text-ink" aria-label="NSS LICET">
          <span className="flex overflow-hidden pb-[0.06em]" aria-hidden>
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, delay: 0.15 + i * 0.05, ease }}
                className="inline-block whitespace-pre"
              >
                {ch}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ rotate: -180, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.7, ease }}
            className="ml-[0.04em] mt-[0.08em] block w-[0.3em] shrink-0"
          >
            <Image src="/brand/nss-logo.png" alt="NSS emblem" width={200} height={200} priority className="h-auto w-full" />
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease }}
          className="mt-3 text-center font-serif text-[clamp(1.4rem,2.4vw,2.1rem)] text-ink/50"
        >
          Not me, <em className="text-nss-red">but you.</em>
        </motion.p>

        {/* Dateline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="mt-6 grid grid-cols-1 items-center gap-2 font-display text-[14px] text-ink/70 sm:grid-cols-3"
        >
          <span className="flex items-center gap-2">
            <Image src="/brand/licet-logo.png" alt="LICET" width={22} height={22} className="h-[22px] w-[22px]" />
            Loyola-ICAM College of Engineering &amp; Technology
          </span>
          {nextEvent ? (
            <Link href={`/events/${nextEvent.slug}`} className="group justify-self-center text-center transition-colors hover:text-nss-red">
              <span className="text-ink/45">Next up — </span>
              {nextEvent.title}, {nextEvent.date}
              <ArrowUpRight size={14} className="mb-0.5 ml-0.5 inline transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span />
          )}
          <span className="tabular-nums sm:text-right">
            <LiveTime /> &nbsp;<LiveDate />
          </span>
        </motion.div>

        {/* Ruled nav */}
        <nav aria-label="Primary" className="relative mt-3">
          <Rule delay={1} />
          <ul className="flex items-center justify-start gap-x-8 overflow-x-auto py-3 font-serif text-[22px] text-ink sm:justify-center [scrollbar-width:none]">
            {NAV_LINKS.map((l, i) => (
              <motion.li key={l.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 + i * 0.05 }}>
                <Link href={l.href} className="whitespace-nowrap transition-colors hover:text-nss-red">
                  {l.label}
                </Link>
              </motion.li>
            ))}
            <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="text-ink/20">
              |
            </motion.li>
            <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.45 }}>
              <Link href={signedIn?.href ?? "/register"} className="whitespace-nowrap italic text-nss-red transition-colors hover:text-navy-600">
                {signedIn?.label ?? "Join NSS"}
              </Link>
            </motion.li>
          </ul>
          <Rule delay={1.1} />
        </nav>
      </div>
    </header>
  );
}

function Rule({ delay }: { delay: number }) {
  return (
    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay, ease }} className="h-px origin-left bg-ink/80" />
  );
}
