import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, CalendarDays, MapPin, Tag } from "lucide-react";
import { RegisterButton } from "@/components/site/event-card";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { Reveal } from "@/components/ui/motion";
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

  return (
    <>
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-ink text-white">
        {event.cover_url && <Image src={event.cover_url} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-40">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
            <ArrowLeft size={16} /> All events
          </Link>
          <Reveal>
            <p className="mt-6 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
              {upcoming ? "Upcoming" : "Completed"} · {event.category}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">{event.title}</h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_22rem]">
        <Reveal>
          <p className="text-xl leading-relaxed text-navy-900/80">{event.summary}</p>
          {event.description && <div className="mt-6 whitespace-pre-line leading-relaxed text-navy-900/70">{event.description}</div>}
        </Reveal>
        <Reveal delay={0.1}>
          <aside className="sticky top-28 space-y-4 rounded-3xl border border-navy-900/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,18,53,.4)]">
            <Detail icon={CalendarDays} label="Date" value={formatDate(event.event_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
            {event.location && <Detail icon={MapPin} label="Location" value={event.location} />}
            <Detail icon={Tag} label="Category" value={event.category} />
            <Detail icon={Award} label="Points" value={`${event.points} points for attending`} />
            {upcoming && <RegisterButton event={event} className="w-full justify-center" />}
          </aside>
        </Reveal>
      </section>

      {photos.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <h2 className="mb-8 font-display text-3xl font-extrabold tracking-tight text-navy-900">Photos</h2>
          <GalleryGrid items={photos} />
        </section>
      )}
    </>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-100 text-navy-800">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-navy-900/45">{label}</p>
        <p className="font-semibold text-navy-900">{value}</p>
      </div>
    </div>
  );
}
