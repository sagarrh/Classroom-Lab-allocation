-- Monday 27 Jan 2025, 08:30–09:00:  ISIG (RS) (64)
INSERT INTO bookings
  (room_no, date,    time_slot,     booked_by, reason, status, approved_by, is_recurring, class,           day_of_week)
VALUES
  ('64',    '2025-01-27', '08:30-09:00', 'RS',      'ISIG',  'pending',  NULL,        FALSE,        'T.Y.BTech-I1', 'Monday');

-- Tuesday 28 Jan 2025, 09:00–09:30:  BDA (SM) (65)
INSERT INTO bookings
  (room_no, date,    time_slot,     booked_by, reason, status, approved_by, is_recurring, class,           day_of_week)
VALUES
  ('65',    '2025-01-28', '09:00-09:30', 'SM',      'BDA',   'pending',  NULL,        FALSE,        'T.Y.BTech-I1', 'Tuesday');

-- Wednesday 29 Jan 2025, 09:00–09:30:  ML (LS) (65)
INSERT INTO bookings
  (room_no, date,    time_slot,     booked_by, reason, status, approved_by, is_recurring, class,           day_of_week)
VALUES
  ('65',    '2025-01-29', '09:00-09:30', 'LS',      'ML',    'pending',  NULL,        FALSE,        'T.Y.BTech-I1', 'Wednesday');

-- …and so on for every non‑break cell in your sheet…
