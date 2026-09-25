"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLink, Link2, Plus } from "lucide-react";
import { deleteEvent, saveEvent } from "../../actions";
import { ActionForm, Card, ConfirmButton, ImageField, SubmitButton, Switch, input, label } from "@/components/admin/ui";
import type { EventItem } from "@/lib/types";
import { cn, formatDate, isUpcoming } from "@/lib/utils";

const CATEGORIES = ["Environment", "Health", "Awareness", "Outreach", "Volunteering", "Orientation", "Ceremony", "Sports", "Community"];

export function EventsManager({ events }: { events: EventItem[] }) {
  const [editing, setEditing] = useState<EventItem | "new" | null>(null);
  const current = editing === "new" ? null : editing;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_28rem]">
      <Card
        title={`${events.length} events`}
        actions={
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 rounded-xl bg-nss-red px-4 py-2.5 text-sm font-bold text-white">
            <Plus size={16} /> New event
          </button>
        }
      >
        <ul className="divide-y divide-navy-900/5">
          {events.map((e) => (
            <li key={e.id} className={cn("flex items-center gap-4 py-3", current?.id === e.id && "bg-paper")}>
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                {e.cover_url && <Image src={e.cover_url} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <button onClick={() => setEditing(e)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-bold text-navy-900 hover:text-nss-red">{e.title}</p>
                <p className="text-xs text-navy-900/50">
                  {formatDate(e.event_date)} · {e.category} · {e.points} pts
                </p>
              </button>
              <div className="hidden items-center gap-2 sm:flex">
                {isUpcoming(e.event_date) && <span className="rounded-full bg-saffron/20 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-900">Upcoming</span>}
                {!e.is_published && <span className="rounded-full bg-navy-900/10 px-2 py-0.5 text-[10px] font-bold uppercase">Draft</span>}
                {e.register_url ? (
                  <a href={e.register_url} target="_blank" rel="noreferrer" title="Google Form" className="text-emerald-600">
                    <Link2 size={16} />
                  </a>
                ) : (
                  isUpcoming(e.event_date) && <span className="text-[10px] font-bold text-nss-red">No form</span>
                )}
              </div>
              <ConfirmButton message={`Delete "${e.title}"? Attendance for it will be removed too.`} onConfirm={() => deleteEvent(e.id)} />
            </li>
          ))}
        </ul>
      </Card>

      {editing && (
        <Card title={current ? "Edit event" : "New event"} className="xl:sticky xl:top-6 xl:self-start">
          <ActionForm key={current?.id ?? "new"} action={saveEvent} className="space-y-4" onSuccess={() => !current && setEditing(null)}>
            {current && <input type="hidden" name="id" value={current.id} />}
            <Text name="title" label="Title" defaultValue={current?.title} required />
            <div className="grid grid-cols-2 gap-3">
              <Text name="event_date" label="Date" type="date" defaultValue={current?.event_date} required />
              <Text name="points" label="Points" type="number" defaultValue={String(current?.points ?? 10)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={label}>Category</span>
                <select name="category" defaultValue={current?.category ?? "Community"} className={input}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <Text name="location" label="Location" defaultValue={current?.location} />
            </div>
            <Text name="register_url" label="Google Form link" placeholder="https://forms.gle/…" defaultValue={current?.register_url} />
            <Text name="summary" label="Short summary" defaultValue={current?.summary} />
            <label className="block">
              <span className={label}>Full description</span>
              <textarea name="description" rows={4} defaultValue={current?.description ?? ""} className={input} />
            </label>
            <div>
              <span className={label}>Cover photo</span>
              <ImageField name="cover_url" folder="events" defaultValue={current?.cover_url} />
            </div>
            <Text name="slug" label="URL slug (optional)" defaultValue={current?.slug} placeholder="auto from title" />
            <Published initial={current?.is_published ?? true} />
            <div className="flex gap-2">
              <SubmitButton className="flex-1">{current ? "Save changes" : "Create event"}</SubmitButton>
              {current && (
                <a href={`/events/${current.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-xl border border-navy-900/15 px-4 text-sm font-bold">
                  View <ExternalLink size={14} />
                </a>
              )}
            </div>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}

function Text({ name, label: l, defaultValue, ...rest }: { name: string; label: string; defaultValue?: string | null } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <label className="block">
      <span className={label}>{l}</span>
      <input name={name} defaultValue={defaultValue ?? ""} className={input} {...rest} />
    </label>
  );
}

function Published({ initial }: { initial: boolean }) {
  const [v, setV] = useState(initial);
  return (
    <div className="flex items-center justify-between rounded-xl bg-paper px-4 py-3">
      <span className="text-sm font-bold text-navy-900">Published on site</span>
      <Switch name="is_published" checked={v} onChange={setV} />
    </div>
  );
}
