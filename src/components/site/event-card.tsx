"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { TiltCard } from "@/components/ui/motion";
import type { EventItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function RegisterButton({ event, className }: { event: EventItem; className?: string }) {
  if (!event.register_url) {
    return (
      <span className={cn("inline-flex items-center gap-2 rounded-full bg-navy-900/8 px-4 py-2 text-sm font-semibold text-navy-900/50", className)}>
        <Clock size={15} /> Registration opens soon
      </span>
    );
  }
  return (
    <a
      href={event.register_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-nss-red px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-nss-red/25",
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-navy-900 transition-transform duration-500 ease-out group-hover/btn:translate-x-0" />
      <span className="relative">Register now</span>
      <ArrowUpRight size={16} className="relative transition-transform group-hover/btn:rotate-45" />
    </a>
  );
}

export function EventCard({ event, upcoming, index = 0 }: { event: EventItem; upcoming: boolean; index?: number }) {
  const date = new Date(event.event_date + "T00:00:00");
  return (
    <TiltCard max={6} className="h-full rounded-3xl">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-[0_20px_50px_-30px_rgba(10,18,53,.45)]">
        <Link href={`/events/${event.slug}`} data-cursor="View" className="relative block aspect-[4/3] overflow-hidden">
          {event.cover_url && (
            <Image
              src={event.cover_url}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-110"
              priority={index < 2}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex flex-col items-center rounded-2xl bg-white/95 px-3 py-2 text-center text-navy-900 shadow-lg backdrop-blur">
            <span className="text-[10px] font-bold uppercase tracking-widest text-nss-red">{date.toLocaleDateString("en-IN", { month: "short" })}</span>
            <span className="font-display text-2xl font-extrabold leading-none">{date.getDate()}</span>
          </div>
          <span
            className={cn(
              "absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
              upcoming ? "bg-saffron text-ink" : "bg-ink/60 text-white backdrop-blur",
            )}
          >
            {upcoming ? "Upcoming" : event.category}
          </span>
        </Link>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-xl font-bold leading-tight text-navy-900">
            <Link href={`/events/${event.slug}`} className="hover:text-nss-red">
              {event.title}
            </Link>
          </h3>
          {event.summary && <p className="line-clamp-2 text-sm leading-relaxed text-navy-900/65">{event.summary}</p>}
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-semibold text-navy-900/55">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> {formatDate(event.event_date)}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} /> {event.location}
              </span>
            )}
          </div>
          {upcoming && (
            <div className="pt-2">
              <RegisterButton event={event} />
            </div>
          )}
        </div>
      </article>
    </TiltCard>
  );
}
