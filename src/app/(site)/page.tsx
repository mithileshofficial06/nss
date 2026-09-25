import { FieldCarousel, type Slide } from "@/components/site/landing/field-carousel";
import { Masthead } from "@/components/site/landing/masthead";
import { MissionVision } from "@/components/site/landing/mission-vision";
import { Objectives } from "@/components/site/landing/objectives";
import { OfficeBearers } from "@/components/site/landing/office-bearers";
import { getBatches, getCurrentProfile, getEvents, getOfficeBearers } from "@/lib/data";
import { formatDate, isUpcoming } from "@/lib/utils";

// Captions follow the original photo names from the NSS drive
const slides: Slide[] = [
  { src: "/images/events/beach-cleanup-2025.webp", title: "Beach Clean-Up", meta: "Environment · 2025" },
  { src: "/images/events/blood-donation-2026.webp", title: "Blood Donation Camp", meta: "Health · 2026" },
  { src: "/images/events/road-safety-rally-2026.webp", title: "Road Safety Rally", meta: "Awareness · 2026" },
  { src: "/images/events/blanket-donation-2025.webp", title: "Blanket Donation", meta: "Outreach · 2025" },
  { src: "/images/orientation/orientation-1.webp", title: "Orientation Day", meta: "Orientation · 2026" },
  { src: "/images/events/cleanup-drive-2024.webp", title: "Clean-Up Drive", meta: "Environment · 2024" },
  { src: "/images/events/outreach-2024.webp", title: "Outreach", meta: "Community · 2024" },
  { src: "/images/events/zero-accident-day-2024.webp", title: "Zero Accident Day", meta: "Awareness · 2024" },
  { src: "/images/events/rally-2026-b.webp", title: "Awareness Rally", meta: "Awareness · 2026" },
];

export default async function HomePage() {
  const [events, profile, team, batches] = await Promise.all([getEvents(), getCurrentProfile(), getOfficeBearers(), getBatches()]);
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
      />
      <MissionVision />
      <FieldCarousel slides={slides} />
      <Objectives />
      <OfficeBearers people={current} batchLabels={batchLabels} />
    </>
  );
}
