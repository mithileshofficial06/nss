-- Seed content taken from the NSS drive export (reports 2025-26, OB list 2025-26, photos).
-- Safe to edit/delete later from the admin panel.

insert into public.batches (label, start_year, end_year) values
  ('22-26', 2022, 2026),
  ('23-27', 2023, 2027),
  ('24-28', 2024, 2028),
  ('25-29', 2025, 2029),
  ('26-30', 2026, 2030)
on conflict (label) do nothing;

insert into public.events (title, slug, summary, category, event_date, location, cover_url, points) values
  ('NSS Orientation Day 2025', 'orientation-2025',
   'Welcomed first-year students to the NSS family — objectives, logo, motto and the annual plan.',
   'Orientation', '2025-08-28', 'C30, LICET', '/images/orientation/orientation-6.webp', 5),
  ('NSS Installation Day', 'installation-day-2025',
   'Induction of the new office bearers and appreciation of the outgoing team.',
   'Ceremony', '2025-09-11', 'LICET', '/images/orientation/orientation-9.webp', 5),
  ('NSS Day Celebration', 'nss-day-2025',
   'NSS pledge for students and faculty, followed by a quiz on society and social service.',
   'Awareness', '2025-09-24', 'LICET', '/images/orientation/orientation-11.webp', 10),
  ('Soles for Souls Marathon', 'soles-for-souls-2025',
   'A marathon spreading awareness about building a drug-free society and healthy lifestyles.',
   'Awareness', '2025-09-28', 'Chennai', '/images/events/rally-2026-b.webp', 20),
  ('Beach Clean-Up Drive', 'beach-cleanup-2025',
   'Jointly organised by NSS and YRC with the Times of India to promote a cleaner coastline.',
   'Environment', '2025-11-08', 'Chennai beach', '/images/events/beach-cleanup-2025.webp', 25),
  ('Elocution & Quiz Competition', 'vigilance-quiz-2025',
   'Vigilance awareness programme with YRC promoting ethics and social responsibility.',
   'Awareness', '2025-11-14', 'LICET', '/images/orientation/orientation-8.webp', 10),
  ('Blanket Donation Drive', 'blanket-donation-2025',
   'Distributed blankets to people in need as part of NSS community outreach.',
   'Outreach', '2025-12-26', 'Chennai', '/images/events/blanket-donation-2025.webp', 25),
  ('Campus Clean-Up Drive', 'cleanup-drive-2026',
   'A clean-up drive with YRC and AICUF for first-year students to keep the campus clean.',
   'Environment', '2026-01-08', 'LICET campus', '/images/events/cleanup-drive-2024.webp', 15),
  ('Urbaser Sumeet Awareness Event', 'urbaser-sumeet-2026',
   'Interactive activities creating awareness on waste segregation.',
   'Environment', '2026-01-19', 'Chennai', '/images/events/outreach-2024.webp', 15),
  ('Republic Day Volunteering', 'republic-day-2026',
   'Volunteers supported the organising team for a smooth Republic Day celebration.',
   'Volunteering', '2026-01-26', 'LICET', '/images/events/zero-accident-day-2024.webp', 10),
  ('Blood Donation Camp', 'blood-donation-2026',
   'A voluntary blood donation camp supporting local healthcare needs.',
   'Health', '2026-01-30', 'LICET', '/images/events/blood-donation-2026.webp', 30),
  ('Road Safety Rally', 'road-safety-rally-2026',
   'Road safety awareness rally with YRC and AICUF for first, second and third years.',
   'Awareness', '2026-02-12', 'Nungambakkam', '/images/events/road-safety-rally-2026.webp', 20),
  ('Sports Day Volunteering', 'sports-day-2026',
   'Volunteers assisted the organising team throughout Sports Day.',
   'Volunteering', '2026-02-21', 'LICET grounds', '/images/orientation/orientation-3.webp', 10),
  ('Coppa Cuore 2026', 'coppa-cuore-2026',
   'A charity football tournament organised by NSS LICET with sponsor Decathlon.',
   'Sports', '2026-03-16', 'LICET grounds', '/images/orientation/orientation-10.webp', 20),
  ('NSS Orientation Day 2026', 'orientation-2026',
   'Orientation for the 2026-30 batch — introducing NSS, its values and the year ahead.',
   'Orientation', '2026-09-17', 'LICET', '/images/orientation/orientation-1.webp', 5),
  -- upcoming (register links to be added by admin)
  ('Gandhi Jayanti Cleanliness Drive', 'gandhi-jayanti-2026',
   'Campus & community cleanliness drive with a street play on non-violence.',
   'Environment', '2026-10-02', 'LICET & neighbourhood', '/images/events/cleanup-drive-2024.webp', 20),
  ('World Mental Health Day', 'mental-health-day-2026',
   'Guest talk and a Hope Wall where students share messages of positivity.',
   'Health', '2026-10-10', 'LICET', '/images/orientation/orientation-12.webp', 10),
  ('Visit to Old Age Home', 'older-persons-visit-2026',
   'Cultural programme and interactive sessions spreading love and care to elders.',
   'Outreach', '2026-10-24', 'Chennai', '/images/events/outreach-2024.webp', 25)
on conflict (slug) do nothing;

-- Gallery: orientation day 2026 photos
insert into public.gallery (event_id, image_url, caption, sort_order)
select e.id, '/images/orientation/orientation-' || n || '.webp', 'Orientation Day 2026', n
from public.events e, generate_series(1, 12) n
where e.slug = 'orientation-2026';

insert into public.gallery (event_id, image_url, caption, sort_order)
select e.id, v.url, v.caption, 1
from (values
  ('beach-cleanup-2025',     '/images/events/beach-cleanup-2025.webp',     'Beach Clean-Up 2025'),
  ('blanket-donation-2025',  '/images/events/blanket-donation-2025.webp',  'Blanket Donation 2025'),
  ('blood-donation-2026',    '/images/events/blood-donation-2026.webp',    'Blood Donation 2026'),
  ('road-safety-rally-2026', '/images/events/road-safety-rally-2026.webp', 'Road Safety Rally 2026'),
  ('road-safety-rally-2026', '/images/events/rally-2026-b.webp',           'Road Safety Rally 2026'),
  ('cleanup-drive-2026',     '/images/events/cleanup-drive-2024.webp',     'Clean-Up Drive'),
  ('urbaser-sumeet-2026',    '/images/events/outreach-2024.webp',          'Outreach'),
  ('republic-day-2026',      '/images/events/zero-accident-day-2024.webp', 'Zero Accident Day')
) as v(slug, url, caption)
join public.events e on e.slug = v.slug;

-- Office bearers 2025-26 (III years -> batch 23-27, II years -> batch 24-28)
insert into public.office_bearers (batch_id, tenure, name, position, team, department, sort_order)
select b.id, '2025-26', v.name, v.position, v.team, v.dept, v.ord
from (values
  ('23-27', 'Francis Roger A',        'President',              'Office Bearers', 'III CSE A', 1),
  ('23-27', 'Anbarasi',               'Vice President',         'Office Bearers', 'III CSE A', 2),
  ('24-28', 'Livinius Christy Raj L', 'Secretary',              'Office Bearers', 'II CSE B',  3),
  ('24-28', 'Kaviya Dharshini S',     'Joint Secretary',        'Office Bearers', 'II EEE',    4),
  ('24-28', 'Sujith G',               'HR',                     'Office Bearers', 'II Mech',   5),
  ('24-28', 'A. Rebacca',             'Treasurer',              'Office Bearers', 'II CSE B',  6),
  ('24-28', 'Dario J',                'Social Media Executive', 'Office Bearers', 'II AIDS',   7),
  ('24-28', 'Priyadharshan V',        'Registrar',              'Office Bearers', 'II CSE B',  8),
  ('24-28', 'Roweena P',              'Scribe',                 'Office Bearers', 'II IT',     9),
  ('24-28', 'Jessica C',              'Media Team',             'Media Team',     'II AIDS',   20),
  ('24-28', 'Felix Palraj',           'Media Team',             'Media Team',     'II CSA',    21),
  ('24-28', 'Gokul Krishna Moorthy',  'Media Team',             'Media Team',     'II CSA',    22),
  ('24-28', 'Jemira Fathima',         'Media Team',             'Media Team',     'II IT',     23),
  ('24-28', 'Jefrina V',              'Media Team',             'Media Team',     'II IT',     24),
  ('24-28', 'Saravanan T',            'Media Team',             'Media Team',     'II IT',     25)
) as v(batch, name, position, team, dept, ord)
join public.batches b on b.label = v.batch;
