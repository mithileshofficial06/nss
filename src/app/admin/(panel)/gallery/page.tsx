import type { Metadata } from "next";
import { GalleryManager } from "./gallery-manager";
import { PageTitle } from "@/components/admin/ui";
import { getGallery } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const [items, { data: events }] = await Promise.all([getGallery(), supabase.from("events").select("id, title, event_date").order("event_date", { ascending: false })]);
  return (
    <>
      <PageTitle title="Gallery" description="Upload event photos (from the Drive or your phone). They're resized to WebP automatically." />
      <GalleryManager items={items} events={events ?? []} />
    </>
  );
}
