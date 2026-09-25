import { Hero } from "@/components/site/hero";
import { MissionVision } from "@/components/site/landing/mission-vision";
import { getEvents, getPublicStats } from "@/lib/data";
import { isUpcoming } from "@/lib/utils";

export default async function HomePage() {
  const [stats, events] = await Promise.all([getPublicStats(), getEvents()]);
  // events are newest-first, so the last upcoming one is the soonest
  const next = events.filter((e) => isUpcoming(e.event_date)).at(-1);

  return (
    <>
      <Hero stats={{ events: stats.events, batches: stats.batches }} nextEvent={next ? { title: next.title, slug: next.slug } : null} />
      <MissionVision />
    </>
  );
}
