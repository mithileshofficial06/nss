// Demo content mirroring supabase/migrations/*_seed_content.sql.
// Only used when Supabase env vars are not set, so the public site can be previewed offline.
import type { Batch, EventItem, GalleryItem, LeaderboardRow, OfficeBearer, SiteSettings } from "./types";

export const fallbackBatches: Batch[] = [
  ["22-26", 2022, 2026],
  ["23-27", 2023, 2027],
  ["24-28", 2024, 2028],
  ["25-29", 2025, 2029],
  ["26-30", 2026, 2030],
].map(([label, s, e]) => ({ id: `b-${label}`, label: label as string, start_year: s as number, end_year: e as number, is_active: true }));

type Seed = [slug: string, title: string, summary: string, category: string, date: string, location: string, cover: string, points: number];

const seeds: Seed[] = [
  ["orientation-2025", "NSS Orientation Day 2025", "Welcomed first-year students to the NSS family — objectives, logo, motto and the annual plan.", "Orientation", "2025-08-28", "C30, LICET", "/images/orientation/orientation-6.webp", 5],
  ["installation-day-2025", "NSS Installation Day", "Induction of the new office bearers and appreciation of the outgoing team.", "Ceremony", "2025-09-11", "LICET", "/images/orientation/orientation-9.webp", 5],
  ["nss-day-2025", "NSS Day Celebration", "NSS pledge for students and faculty, followed by a quiz on society and social service.", "Awareness", "2025-09-24", "LICET", "/images/orientation/orientation-11.webp", 10],
  ["soles-for-souls-2025", "Soles for Souls Marathon", "A marathon spreading awareness about building a drug-free society and healthy lifestyles.", "Awareness", "2025-09-28", "Chennai", "/images/events/rally-2026-b.webp", 20],
  ["beach-cleanup-2025", "Beach Clean-Up Drive", "Jointly organised by NSS and YRC with the Times of India to promote a cleaner coastline.", "Environment", "2025-11-08", "Chennai beach", "/images/events/beach-cleanup-2025.webp", 25],
  ["vigilance-quiz-2025", "Elocution & Quiz Competition", "Vigilance awareness programme with YRC promoting ethics and social responsibility.", "Awareness", "2025-11-14", "LICET", "/images/orientation/orientation-8.webp", 10],
  ["blanket-donation-2025", "Blanket Donation Drive", "Distributed blankets to people in need as part of NSS community outreach.", "Outreach", "2025-12-26", "Chennai", "/images/events/blanket-donation-2025.webp", 25],
  ["cleanup-drive-2026", "Campus Clean-Up Drive", "A clean-up drive with YRC and AICUF for first-year students to keep the campus clean.", "Environment", "2026-01-08", "LICET campus", "/images/events/cleanup-drive-2024.webp", 15],
  ["urbaser-sumeet-2026", "Urbaser Sumeet Awareness Event", "Interactive activities creating awareness on waste segregation.", "Environment", "2026-01-19", "Chennai", "/images/events/outreach-2024.webp", 15],
  ["republic-day-2026", "Republic Day Volunteering", "Volunteers supported the organising team for a smooth Republic Day celebration.", "Volunteering", "2026-01-26", "LICET", "/images/events/zero-accident-day-2024.webp", 10],
  ["blood-donation-2026", "Blood Donation Camp", "A voluntary blood donation camp supporting local healthcare needs.", "Health", "2026-01-30", "LICET", "/images/events/blood-donation-2026.webp", 30],
  ["road-safety-rally-2026", "Road Safety Rally", "Road safety awareness rally with YRC and AICUF for first, second and third years.", "Awareness", "2026-02-12", "Nungambakkam", "/images/events/road-safety-rally-2026.webp", 20],
  ["sports-day-2026", "Sports Day Volunteering", "Volunteers assisted the organising team throughout Sports Day.", "Volunteering", "2026-02-21", "LICET grounds", "/images/orientation/orientation-3.webp", 10],
  ["coppa-cuore-2026", "Coppa Cuore 2026", "A charity football tournament organised by NSS LICET with sponsor Decathlon.", "Sports", "2026-03-16", "LICET grounds", "/images/orientation/orientation-10.webp", 20],
  ["orientation-2026", "NSS Orientation Day 2026", "Orientation for the 2026-30 batch — introducing NSS, its values and the year ahead.", "Orientation", "2026-09-17", "LICET", "/images/orientation/orientation-1.webp", 5],
  ["gandhi-jayanti-2026", "Gandhi Jayanti Cleanliness Drive", "Campus & community cleanliness drive with a street play on non-violence.", "Environment", "2026-10-02", "LICET & neighbourhood", "/images/events/cleanup-drive-2024.webp", 20],
  ["mental-health-day-2026", "World Mental Health Day", "Guest talk and a Hope Wall where students share messages of positivity.", "Health", "2026-10-10", "LICET", "/images/orientation/orientation-12.webp", 10],
  ["older-persons-visit-2026", "Visit to Old Age Home", "Cultural programme and interactive sessions spreading love and care to elders.", "Outreach", "2026-10-24", "Chennai", "/images/events/outreach-2024.webp", 25],
];

export const fallbackEvents: EventItem[] = seeds.map(([slug, title, summary, category, date, location, cover, points]) => ({
  id: `e-${slug}`,
  slug,
  title,
  summary,
  description: null,
  category,
  event_date: date,
  end_date: null,
  location,
  cover_url: cover,
  register_url: null,
  points,
  is_published: true,
}));

const eventIdBySlug = (slug: string) => `e-${slug}`;

export const fallbackGallery: GalleryItem[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `g-o-${i + 1}`,
    event_id: eventIdBySlug("orientation-2026"),
    image_url: `/images/orientation/orientation-${i + 1}.webp`,
    caption: "Orientation Day 2026",
    sort_order: i + 1,
  })),
  ...(
    [
      ["beach-cleanup-2025", "/images/events/beach-cleanup-2025.webp", "Beach Clean-Up 2025"],
      ["blanket-donation-2025", "/images/events/blanket-donation-2025.webp", "Blanket Donation 2025"],
      ["blood-donation-2026", "/images/events/blood-donation-2026.webp", "Blood Donation 2026"],
      ["road-safety-rally-2026", "/images/events/road-safety-rally-2026.webp", "Road Safety Rally 2026"],
      ["road-safety-rally-2026", "/images/events/rally-2026-b.webp", "Road Safety Rally 2026"],
      ["cleanup-drive-2026", "/images/events/cleanup-drive-2024.webp", "Clean-Up Drive"],
      ["urbaser-sumeet-2026", "/images/events/outreach-2024.webp", "Outreach"],
      ["republic-day-2026", "/images/events/zero-accident-day-2024.webp", "Zero Accident Day"],
    ] as const
  ).map(([slug, url, caption], i) => ({ id: `g-e-${i}`, event_id: eventIdBySlug(slug), image_url: url, caption, sort_order: 1 })),
];

const ob = (batch: string, name: string, position: string, team: string, department: string, sort_order: number): OfficeBearer => ({
  id: `ob-${sort_order}`,
  batch_id: `b-${batch}`,
  tenure: "2025-26",
  name,
  position,
  team,
  department,
  photo_url: null,
  sort_order,
});

export const fallbackOfficeBearers: OfficeBearer[] = [
  ob("23-27", "Francis Roger A", "President", "Office Bearers", "III CSE A", 1),
  ob("23-27", "Anbarasi", "Vice President", "Office Bearers", "III CSE A", 2),
  ob("24-28", "Livinius Christy Raj L", "Secretary", "Office Bearers", "II CSE B", 3),
  ob("24-28", "Kaviya Dharshini S", "Joint Secretary", "Office Bearers", "II EEE", 4),
  ob("24-28", "Sujith G", "HR", "Office Bearers", "II Mech", 5),
  ob("24-28", "A. Rebacca", "Treasurer", "Office Bearers", "II CSE B", 6),
  ob("24-28", "Dario J", "Social Media Executive", "Office Bearers", "II AIDS", 7),
  ob("24-28", "Priyadharshan V", "Registrar", "Office Bearers", "II CSE B", 8),
  ob("24-28", "Roweena P", "Scribe", "Office Bearers", "II IT", 9),
  ob("24-28", "Jessica C", "Media Team", "Media Team", "II AIDS", 20),
  ob("24-28", "Felix Palraj", "Media Team", "Media Team", "II CSA", 21),
  ob("24-28", "Gokul Krishna Moorthy", "Media Team", "Media Team", "II CSA", 22),
  ob("24-28", "Jemira Fathima", "Media Team", "Media Team", "II IT", 23),
  ob("24-28", "Jefrina V", "Media Team", "Media Team", "II IT", 24),
  ob("24-28", "Saravanan T", "Media Team", "Media Team", "II IT", 25),
];

export const fallbackSettings: SiteSettings = {
  blur_attendance: true,
  blur_activities: true,
  blur_points: true,
  leaderboard_public: true,
  registration_open: true,
  announcement: null,
};

// Sample standings so the leaderboard UI can be previewed without a database.
const sampleNames = [
  ["Krithika B", "AIDS"], ["Maria Arul Varun X", "CSE B"], ["Sakthi Sri Harshitha", "ECE"], ["Mohamed Arshad", "MECH"],
  ["Daniel Aaro X", "ECE"], ["Pavithra N", "AIDS"], ["Sweety", "IT"], ["Shyam Samuel A", "AIDS"],
  ["Thea Dorothy", "EEE"], ["Jeevan E", "MECH"], ["Riya Theresa J", "IT"], ["Trina Michelle J", "CSE B"],
];
export function fallbackLeaderboard(batchId: string): LeaderboardRow[] {
  const seed = batchId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return sampleNames
    .map(([full_name, department], i) => ({
      student_id: `s-${i}`,
      full_name,
      department,
      avatar_url: null,
      points: 40 + ((seed * (i + 3) * 37) % 180),
      events_attended: 1 + ((seed + i * 7) % 9),
      rank: 0,
    }))
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
