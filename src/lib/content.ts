/**
 * Editable site copy and photos. Each top-level key is one row in public.site_content (managed from
 * Admin → Site content). Anything missing from the database falls back to these defaults, so the
 * site renders the same before an admin has saved anything.
 *
 * In text fields, *asterisks* mark the accent words (set in italic serif / NSS colour).
 */

export type Photo = { src: string; caption: string };
export type Slide = { src: string; title: string; meta: string; word: string };
export type Objective = { title: string; text: string; image?: string };

export type SiteContent = {
  hero: {
    schemeLeft: string;
    schemeRight: string;
    hindi: string;
    motto: string;
    college: string;
    address: string;
    subline: string;
    aboutKicker: string;
    aboutHeadline: string;
    aboutBody: string;
    leadPhotos: Photo[];
  };
  about: {
    statement: string;
    vision: string;
    missions: string[];
    portrait: Photo & { date: string };
    mottoText: string;
    mottoImage: string;
  };
  slides: Slide[];
  objectives: { heading: string; intro: string; items: Objective[] };
  pages: Record<"events" | "gallery" | "leaderboard" | "team", { title: string; intro: string }>;
  footer: { blurb: string; address: string; email: string };
};

export const CONTENT_KEYS = ["hero", "about", "slides", "objectives", "pages", "footer"] as const satisfies readonly (keyof SiteContent)[];
export type ContentKey = (typeof CONTENT_KEYS)[number];

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    schemeLeft: "National Service Scheme · Est. 1969",
    schemeRight: "Ministry of Youth Affairs & Sports · Govt. of India",
    hindi: "राष्ट्रीय सेवा योजना",
    motto: "Not me, *but you*",
    college: "Loyola-ICAM College of Engineering *&* Technology",
    address: "Loyola Campus, Nungambakkam, Chennai 600034",
    subline: "Autonomous · Tamil Nadu",
    aboutKicker: "The unit",
    aboutHeadline: "Engineers in training, learning that the problems worth solving are *human ones.*",
    aboutBody:
      "Since 1969, the National Service Scheme has asked students to learn through service. At LICET that means beach clean-ups, blood-donation camps, road-safety rallies and outreach in the communities around Chennai — with every hour logged to your batch.",
    leadPhotos: [
      { src: "/images/orientation/orientation-1.webp", caption: "Orientation Day, 2026" },
      { src: "/images/events/beach-cleanup-2025.webp", caption: "Beach Clean-Up, 2025" },
      { src: "/images/events/blood-donation-2026.webp", caption: "Blood Donation Camp, 2026" },
      { src: "/images/events/road-safety-rally-2026.webp", caption: "Road Safety Rally, 2026" },
    ],
  },
  about: {
    statement:
      "NSS LICET is the National Service Scheme unit of Loyola-ICAM College of Engineering and Technology — a Government of India programme where future engineers learn that the problems worth solving are *human* ones.",
    vision: "To develop the personality and character of students through *voluntary community service*.",
    missions: ["Serve where the need is real", "Build civic responsibility", "Partner for lasting impact", "Promote health & awareness"],
    portrait: { src: "/images/orientation/orientation-9.webp", caption: "Orientation Day", date: "17.09.2026" },
    mottoText:
      "It reflects the essence of democratic living — selfless service, respect for another's point of view, and consideration for fellow human beings.",
    mottoImage: "/images/events/blanket-donation-2025.webp",
  },
  // Captions follow the original photo names from the NSS drive
  slides: [
    { src: "/images/events/beach-cleanup-2025.webp", word: "Beach", title: "Beach Clean-Up", meta: "Environment · 2025" },
    { src: "/images/events/blood-donation-2026.webp", word: "Blood", title: "Blood Donation Camp", meta: "Health · 2026" },
    { src: "/images/events/road-safety-rally-2026.webp", word: "Safety", title: "Road Safety Rally", meta: "Awareness · 2026" },
    { src: "/images/events/blanket-donation-2025.webp", word: "Warmth", title: "Blanket Donation", meta: "Outreach · 2025" },
    { src: "/images/orientation/orientation-1.webp", word: "Welcome", title: "Orientation Day", meta: "Orientation · 2026" },
    { src: "/images/events/cleanup-drive-2024.webp", word: "Clean-up", title: "Clean-Up Drive", meta: "Environment · 2024" },
    { src: "/images/events/outreach-2024.webp", word: "Outreach", title: "Outreach", meta: "Community · 2024" },
    { src: "/images/events/zero-accident-day-2024.webp", word: "Zero", title: "Zero Accident Day", meta: "Awareness · 2024" },
    { src: "/images/events/rally-2026-b.webp", word: "Rally", title: "Awareness Rally", meta: "Awareness · 2026" },
  ],
  objectives: {
    heading: "*Ten Objectives , one volunteer.*",
    intro: "The National Service Scheme sets out what every volunteer should gain from serving — from knowing the community to practising national integration.",
    // The ten objectives of the National Service Scheme
    items: [
      { title: "Know the community", text: "Understand the community in which they work.", image: "/images/events/road-safety-rally-2026.webp" },
      { title: "Know yourself", text: "Understand themselves in relation to their community.", image: "/images/orientation/orientation-3.webp" },
      { title: "Solve together", text: "Identify the needs and problems of the community and involve them in problem-solving.", image: "/images/events/cleanup-drive-2024.webp" },
      { title: "Civic responsibility", text: "Develop among themselves a sense of social and civic responsibility.", image: "/images/events/blood-donation-2026.webp" },
      { title: "Practical solutions", text: "Use their knowledge to find practical solutions to individual and community problems." },
      { title: "Group living", text: "Develop the competence required for group living and sharing of responsibilities." },
      { title: "Mobilise people", text: "Gain skills in mobilising community participation." },
      { title: "Lead democratically", text: "Acquire leadership qualities and a democratic attitude." },
      { title: "Rise in a crisis", text: "Develop the capacity to meet emergencies and natural disasters." },
      { title: "One nation", text: "Practise national integration and social harmony." },
    ],
  },
  pages: {
    events: {
      title: "Every drive, every rally, every hour.",
      intro: "Register for upcoming events through the Google Form linked on each card. Attendance and points are updated by the NSS team afterwards.",
    },
    gallery: {
      title: "Moments from the field.",
      intro: "Photos from our drives, rallies and orientations. Click any photo to open it full screen — use the arrow keys to browse.",
    },
    leaderboard: { title: "Pick your batch.", intro: "Points are awarded for every event you volunteer at. Standings are maintained by the NSS team." },
    team: { title: "The team that keeps NSS moving.", intro: "Office bearers and media team by tenure and batch." },
  },
  footer: {
    blurb: "National Service Scheme unit of Loyola-ICAM College of Engineering and Technology, Chennai.",
    address: "Loyola Campus, Nungambakkam,\nChennai 600034",
    email: "nss@licet.ac.in",
  },
};

/** Stored values are merged over the defaults one level deep, so a partially saved section still renders. */
export function mergeContent(rows: { key: string; value: unknown }[]): SiteContent {
  const out = structuredClone(DEFAULT_CONTENT) as Record<string, unknown>;
  for (const { key, value } of rows) {
    if (!(key in out) || value == null) continue;
    const base = out[key];
    out[key] = Array.isArray(base) || Array.isArray(value) || typeof value !== "object" ? value : { ...(base as object), ...(value as object) };
  }
  return out as SiteContent;
}
