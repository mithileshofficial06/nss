import type { Metadata } from "next";
import { EventsManager } from "./events-manager";
import { PageTitle } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types";

export const metadata: Metadata = { title: "Events" };

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
  return (
    <>
      <PageTitle title="Events" description="Create events, attach the Google Form registration link, and publish." />
      <EventsManager events={(data ?? []) as EventItem[]} />
    </>
  );
}
