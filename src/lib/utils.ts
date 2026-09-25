import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", opts);
}

export function todayISO() {
  // IST date, so an event "today" still counts as upcoming for the whole day in Chennai
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

export function isUpcoming(eventDate: string) {
  return eventDate >= todayISO();
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((p) => p.length > 1 || /[A-Z]/.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const DEPARTMENTS = ["AIDS", "CSE", "CSA", "IT", "ECE", "EEE", "MECH", "Other"] as const;
