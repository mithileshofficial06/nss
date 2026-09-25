import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { BatchTeaser, PhotoMarquee, Pillars, Stats, TeamPreview, Ticker } from "@/components/site/home-sections";
import { EventCard } from "@/components/site/event-card";
import { Magnetic, Reveal } from "@/components/ui/motion";
import { NssWheel } from "@/components/ui/nss-wheel";
import { getBatches, getEvents, getGallery, getOfficeBearers, getPublicStats } from "@/lib/data";
import { isUpcoming } from "@/lib/utils";

export default async function HomePage() {
  const [events, gallery, batches, team, stats] = await Promise.all([getEvents(), getGallery(), getBatches(), getOfficeBearers(), getPublicStats()]);
  const upcoming = events.filter((e) => isUpcoming(e.event_date)).reverse();
  const featured = (upcoming.length ? upcoming : events).slice(0, 3);

  return (
    <>
      <Hero />
      <Stats stats={stats} />
      <Pillars />
      <div className="py-6">
        <Ticker />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-nss-red">{upcoming.length ? "Coming up" : "Recent"}</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-navy-900 sm:text-6xl">Join the next drive.</h2>
          </div>
          <Link href="/events" className="group inline-flex items-center gap-2 text-sm font-bold text-navy-900">
            All events <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.1} className="h-full">
              <EventCard event={e} upcoming={isUpcoming(e.event_date)} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      <PhotoMarquee items={gallery.slice(0, 16)} />
      <TeamPreview people={team.filter((t) => t.team === "Office Bearers")} />
      <BatchTeaser batches={batches} />

      <section className="relative overflow-hidden px-6 py-32 text-center">
        <NssWheel spin className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 text-navy-900/[0.05]" />
        <Reveal className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-5xl font-extrabold tracking-tight text-navy-900 sm:text-7xl">
            Your hours <span className="text-nss-red">count.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-navy-900/60">
            Register once with your college details to track your events, points and attendance in one place.
          </p>
          <div className="mt-10">
            <Magnetic>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-8 py-4 font-bold text-white transition hover:bg-nss-red">
                Create your volunteer account <ArrowRight size={18} />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </>
  );
}
