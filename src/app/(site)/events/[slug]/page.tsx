import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegisterButton } from "@/components/site/event-card";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { SectionLabel } from "@/components/site/landing/section-label";
import { Reveal, SplitWords } from "@/components/ui/motion";
import { getEvent, getGallery } from "@/lib/data";
import { formatDate, isUpcoming } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return { title: event?.title ?? "Event" };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const photos = await getGallery(event.id);
  const upcoming = isUpcoming(event.event_date);

  const details = [
    ["Date", formatDate(event.event_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
    ["Location", event.location ?? "—"],
    ["Category", event.category],
    ["Points", `${event.points} for attending`],
  ];

  return (
    <article className="bg-white px-5 pb-24 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionLabel label={upcoming ? "Upcoming event" : "Past event"} aside={formatDate(event.event_date)} />
        <Link href="/events" className="mt-6 inline-block font-display text-[15px] font-medium text-ink/55 transition-colors hover:text-nss-red">
          ← All events
        </Link>
        <h1 className="mt-4 max-w-5xl font-serif text-[clamp(3rem,7.5vw,7rem)] leading-[0.9] tracking-[-0.03em] text-ink">
          <SplitWords text={event.title} />
        </h1>

        {event.cover_url && (
          <Reveal className="relative mt-10 aspect-[4/3] overflow-hidden bg-paper sm:aspect-[21/9]">
            <Image src={event.cover_url} alt={event.title} fill priority sizes="100vw" className="object-cover" />
          </Reveal>
        )}

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <p className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">{event.summary}</p>
            {event.description && <div className="mt-6 max-w-2xl whitespace-pre-line text-[17px] leading-relaxed text-ink/70">{event.description}</div>}
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="border-t border-ink font-display text-[16px]">
              {details.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-ink/15 py-3">
                  <dt className="text-ink/50">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {upcoming && <RegisterButton event={event} className="mt-6" />}
          </Reveal>
        </div>

        {photos.length > 0 && (
          <section className="mt-24">
            <SectionLabel label="Photos" aside={`${photos.length} images`} />
            <div className="mt-8">
              <GalleryGrid items={photos} />
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
