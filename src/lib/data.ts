import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import {
  fallbackBatches,
  fallbackEvents,
  fallbackGallery,
  fallbackLeaderboard,
  fallbackOfficeBearers,
  fallbackSettings,
} from "./fallback";
import type { Batch, EventItem, GalleryItem, LeaderboardRow, OfficeBearer, Profile, SiteSettings } from "./types";

export async function getBatches(): Promise<Batch[]> {
  if (!isSupabaseConfigured) return fallbackBatches;
  const supabase = await createClient();
  const { data } = await supabase.from("batches").select("*").order("start_year", { ascending: false });
  return data ?? [];
}

export async function getEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured) return [...fallbackEvents].sort((a, b) => b.event_date.localeCompare(a.event_date));
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("is_published", true).order("event_date", { ascending: false });
  return data ?? [];
}

export async function getEvent(slug: string): Promise<EventItem | null> {
  if (!isSupabaseConfigured) return fallbackEvents.find((e) => e.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getGallery(eventId?: string): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured) {
    return eventId ? fallbackGallery.filter((g) => g.event_id === eventId) : fallbackGallery;
  }
  const supabase = await createClient();
  let q = supabase.from("gallery").select("*").order("sort_order").order("created_at", { ascending: false });
  if (eventId) q = q.eq("event_id", eventId);
  const { data } = await q;
  return data ?? [];
}

export async function getOfficeBearers(): Promise<OfficeBearer[]> {
  if (!isSupabaseConfigured) return fallbackOfficeBearers;
  const supabase = await createClient();
  const { data } = await supabase.from("office_bearers").select("*").order("tenure", { ascending: false }).order("sort_order");
  return data ?? [];
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return fallbackSettings;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").maybeSingle();
  return data ?? fallbackSettings;
});

export async function getLeaderboard(batchId: string): Promise<LeaderboardRow[]> {
  if (!isSupabaseConfigured) return fallbackLeaderboard(batchId);
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_leaderboard", { p_batch_id: batchId });
  return (data ?? []).map((r: LeaderboardRow) => ({ ...r, points: Number(r.points), events_attended: Number(r.events_attended), rank: Number(r.rank) }));
}

export async function getPublicStats() {
  if (!isSupabaseConfigured) {
    return { volunteers: 180, events: fallbackEvents.length, hours: 2400, batches: fallbackBatches.length };
  }
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_stats");
  const row = Array.isArray(data) ? data[0] : data;
  return {
    volunteers: Number(row?.volunteers ?? 0),
    events: Number(row?.events ?? 0),
    hours: Number(row?.hours ?? 0),
    batches: Number(row?.batches ?? 0),
  };
}

/** Current signed-in user's profile, or null. */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
});

export async function requireStudent() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "admin") redirect("/admin/login?error=not-admin");
  return profile;
}
