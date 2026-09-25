export type Batch = {
  id: string;
  label: string;
  start_year: number;
  end_year: number;
  is_active: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: string;
  event_date: string;
  end_date: string | null;
  location: string | null;
  cover_url: string | null;
  register_url: string | null;
  points: number;
  is_published: boolean;
};

export type OfficeBearer = {
  id: string;
  batch_id: string | null;
  tenure: string;
  name: string;
  position: string;
  team: string;
  department: string | null;
  photo_url: string | null;
  sort_order: number;
};

export type GalleryItem = {
  id: string;
  event_id: string | null;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  register_no: string | null;
  department: string | null;
  section: string | null;
  phone: string | null;
  batch_id: string | null;
  avatar_url: string | null;
  role: "student" | "admin";
  reveal_details: boolean;
  created_at: string;
};

export type SiteSettings = {
  blur_attendance: boolean;
  blur_activities: boolean;
  blur_points: boolean;
  leaderboard_public: boolean;
  registration_open: boolean;
  announcement: string | null;
};

export type LeaderboardRow = {
  student_id: string;
  full_name: string;
  department: string | null;
  avatar_url: string | null;
  points: number;
  events_attended: number;
  rank: number;
};

export type AttendanceRow = {
  id: string;
  student_id: string;
  event_id: string;
  status: "present" | "absent" | "excused";
  role: string | null;
  marked_at: string;
};

export type PointsRow = {
  id: string;
  student_id: string;
  event_id: string | null;
  points: number;
  reason: string;
  created_at: string;
};
