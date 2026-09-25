"use client";

import Image from "next/image";
import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/** "Register now ↗" text link to the event's Google Form, or a muted note until the admin adds one. */
export function RegisterButton({ event, className }: { event: EventItem; className?: string }) {
  if (!event.register_url) {
    return <span className={cn("font-display text-[15px] font-medium text-ink/40", className)}>Registration opens soon</span>;
  }
  return (
    <a
      href={event.register_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("group relative inline-flex w-fit items-center gap-1.5 font-display text-[16px] font-semibold text-nss-red", className)}
    >
      <span className="h-2 w-2 bg-nss-red" />
      Register now
      <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 group-hover:scale-x-100" />
    </a>
  );
}

/** Flat editorial event entry: photo, dateline, serif headline, standfirst. */
export function EventCard({ event, upcoming, index = 0 }: { event: EventItem; upcoming: boolean; index?: number }) {
  return (
    <article className="group flex h-full flex-col gap-4">
      <Link href={`/events/${event.slug}`} data-cursor="View" className="relative block aspect-[4/3] overflow-hidden bg-paper">
        {event.cover_url && (
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={cn("object-cover transition duration-1000 ease-out group-hover:scale-105", !upcoming && "grayscale-[35%] group-hover:grayscale-0")}
            priority={index < 2}
          />
        )}
        {upcoming && <span className="absolute left-0 top-0 bg-nss-red px-2.5 py-1 font-display text-[13px] font-semibold text-white">Upcoming</span>}
      </Link>
      <div className="flex items-baseline justify-between border-t border-ink/15 pt-3 font-display text-[14px] font-medium text-ink/50">
        <span>{formatDate(event.event_date)}</span>
        <span>{event.category}</span>
      </div>
      <h3 className="font-serif text-[clamp(1.7rem,2.2vw,2.2rem)] leading-[1] tracking-[-0.015em] text-ink">
        <Link href={`/events/${event.slug}`} className="transition-colors hover:text-nss-red">
          {event.title}
        </Link>
      </h3>
      {event.summary && <p className="line-clamp-3 font-display text-[16px] leading-snug text-ink/65">{event.summary}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1 font-display text-[14px] text-ink/50">
        <span>{event.location}</span>
        {upcoming ? <RegisterButton event={event} /> : <span>{event.points} pts</span>}
      </div>
    </article>
  );
}
