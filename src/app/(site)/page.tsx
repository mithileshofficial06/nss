import { FieldCarousel } from "@/components/site/landing/field-carousel";
import { Masthead } from "@/components/site/landing/masthead";
import { MissionVision } from "@/components/site/landing/mission-vision";
import { Objectives } from "@/components/site/landing/objectives";
import { OfficeBearers } from "@/components/site/landing/office-bearers";
import { getBatches, getContent, getCurrentProfile, getEvents, getOfficeBearers, getPublicStats } from "@/lib/data";
import { formatDate, isUpcoming } from "@/lib/utils";

export default async function HomePage() {
  const [events, profile, team, batches, stats, content] = await Promise.all([
    getEvents(),
    getCurrentProfile(),
    getOfficeBearers(),
    getBatches(),
    getPublicStats(),
    getContent(),
  ]);
  // events are newest-first, so the last upcoming one is the soonest
  const next = events.filter((e) => isUpcoming(e.event_date)).at(-1);
  // office bearers come sorted newest tenure first; the landing page shows only the current one
  const current = team.filter((p) => p.tenure === team[0]?.tenure);
  const batchLabels = Object.fromEntries(batches.map((b) => [b.id, b.label]));
  const signedIn = profile ? { href: profile.role === "admin" ? "/admin" : "/dashboard", label: profile.role === "admin" ? "Admin" : "Dashboard" } : null;

  return (
    <>
      <Masthead
        nextEvent={next ? { title: next.title, slug: next.slug, date: formatDate(next.event_date, { day: "numeric", month: "short" }) } : null}
        signedIn={signedIn}
        stats={stats}
        content={content.hero}
      />
      <MissionVision content={content.about} />
      {content.slides.length > 0 && <FieldCarousel slides={content.slides} />}
      <Objectives content={content.objectives} />
      <OfficeBearers people={current} batchLabels={batchLabels} />
    </>
  );
}
