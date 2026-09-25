import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { EventsBrowser } from "@/components/site/events-browser";
import { getEvents } from "@/lib/data";
import { isUpcoming } from "@/lib/utils";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => isUpcoming(e.event_date)).reverse();
  const past = events.filter((e) => !isUpcoming(e.event_date));

  return (
    <>
      <PageHeader eyebrow="Events" title="Every drive, every rally, every hour.">
        Register for upcoming events through the Google Form linked on each card. Attendance and points are updated by the NSS team afterwards.
      </PageHeader>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <EventsBrowser upcoming={upcoming} past={past} />
      </section>
    </>
  );
}
