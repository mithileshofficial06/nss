import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { EventsBrowser } from "@/components/site/events-browser";
import { getContent, getEvents } from "@/lib/data";
import { isUpcoming } from "@/lib/utils";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const copy = (await getContent()).pages.events;
  const events = await getEvents();
  const upcoming = events.filter((e) => isUpcoming(e.event_date)).reverse();
  const past = events.filter((e) => !isUpcoming(e.event_date));

  return (
    <>
      <PageHeader eyebrow="Events" title={copy.title}>
        {copy.intro}
      </PageHeader>
      <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-4 sm:px-8">
        <EventsBrowser upcoming={upcoming} past={past} />
      </section>
    </>
  );
}
