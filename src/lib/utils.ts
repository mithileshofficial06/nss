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

/** Category of the weekly NSS-hour sessions: tracked for attendance, kept out of public event lists. */
export const NSS_HOUR = "NSS Hour";

/** The seven NSS units; CSE is split by section. Enforced by a check constraint on profiles.department. */
export const DEPARTMENTS = ["CSE A", "CSE B", "AIDS", "IT", "EEE", "ECE", "MECH"] as const;

/**
 * True when a typed name is the same person as the name on file, ignoring case, dots, spacing and
 * word order. Initials are optional ("Vasanth" matches "Vasanth R") and may be spelled out
 * ("Vasanth Ramesh" matches "Vasanth R"), but a conflicting initial ("Vasanth K") does not match.
 */
export function namesMatch(typed: string, onFile: string) {
  const split = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, " ").trim().split(" ").filter(Boolean);
  const t = split(typed);
  const f = split(onFile);
  if (!t.length || !f.length) return false;

  const tWords = t.filter((w) => w.length > 1);
  const fWords = f.filter((w) => w.length > 1);
  const fInitials = f.filter((w) => w.length === 1);
  const tInitials = t.filter((w) => w.length === 1);

  // "Sathiyanarayanaa" for "Sathiya Narayanaa": same letters once the spaces are gone
  if (tWords.join("") === fWords.join("") && tWords.length !== fWords.length) {
    return !tInitials.length || !fInitials.length || tInitials.every((i) => fInitials.includes(i));
  }

  // Every full word on file must be typed; any other typed word must spell out an initial on file
  const left = [...tWords];
  for (const w of fWords) {
    const i = left.indexOf(w);
    if (i === -1) return false;
    left.splice(i, 1);
  }
  const initials = [...fInitials];
  for (const w of left) {
    const i = initials.indexOf(w[0]);
    if (i === -1) return false;
    initials.splice(i, 1);
  }
  // Typed initials only count against the record when the record has initials of its own
  if (!fInitials.length) return true;
  return tInitials.every((c) => {
    const i = initials.indexOf(c);
    return i !== -1 && initials.splice(i, 1).length === 1;
  });
}

/** Maps loose spellings ("cse-a", "CSEB", "Mech") to a DEPARTMENTS value, or null. */
export function normalizeDepartment(raw: string | null | undefined): string | null {
  const key = (raw ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  return DEPARTMENTS.find((d) => d.replace(" ", "") === key) ?? null;
}
