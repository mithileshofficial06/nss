"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { addGalleryImages, deleteGalleryImage, type ActionState } from "../../actions";
import { Card, ConfirmButton, Toast, input, inputAuto, label, uploadImage } from "@/components/admin/ui";
import type { GalleryItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function GalleryManager({ items, events }: { items: GalleryItem[]; events: { id: string; title: string; event_date: string }[] }) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [toast, setToast] = useState<ActionState>(null);
  const [filter, setFilter] = useState("all");
  const titleOf = (id: string | null) => events.find((e) => e.id === id)?.title;
  const shown = filter === "all" ? items : items.filter((i) => i.event_id === filter);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setProgress({ done: 0, total: list.length });
    const urls: string[] = [];
    try {
      for (const f of list) {
        urls.push(await uploadImage(f, "gallery"));
        setProgress((p) => p && { ...p, done: p.done + 1 });
      }
      setToast(await addGalleryImages(urls, eventId || null, caption || titleOf(eventId) || null));
      router.refresh();
    } catch (e) {
      setToast({ ok: false, message: (e as Error).message, at: Date.now() });
    } finally {
      setProgress(null);
    }
  }

  return (
    <>
      <Card title="Upload photos">
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className={label}>Event</span>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={input}>
              <option value="">General (no event)</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {formatDate(e.event_date)} — {e.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={label}>Caption</span>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Defaults to the event name" className={input} />
          </label>
        </div>
        <label
          className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/15 bg-paper py-12 text-ink/60 transition hover:border-navy-600"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
        >
          {progress ? (
            <>
              <Loader2 className="animate-spin" />
              Uploading {progress.done}/{progress.total}…
            </>
          ) : (
            <>
              <ImagePlus size={28} />
              <span className="font-bold">Drop photos here or click to choose</span>
              <span className="text-xs">JPG / PNG / WebP · multiple allowed</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="sr-only" disabled={!!progress} onChange={(e) => onFiles(e.target.files)} />
        </label>
      </Card>

      <Card
        className="mt-6"
        title={`${shown.length} photos`}
        actions={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inputAuto}>
            <option value="all">All</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        }
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((g) => (
            <li key={g.id} className="group relative aspect-square overflow-hidden bg-paper">
              <Image src={g.image_url} alt={g.caption ?? ""} fill sizes="25vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/80 p-2 text-xs text-white">
                <span className="truncate">{g.caption ?? titleOf(g.event_id)}</span>
                <span className="bg-white opacity-0 transition group-hover:opacity-100">
                  <ConfirmButton message="Delete this photo?" onConfirm={() => deleteGalleryImage(g.id).then(() => router.refresh())} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Toast state={toast} />
    </>
  );
}
