/*
# Seed initial academic data

Populates the database with sample classes (spanning grade levels 1-6, lower
to upper), students enrolled in those classes, and scores for each student.

1. Data inserted
- 8 classes across grade levels 1 (lowest) to 6 (highest)
- 12 students distributed across classes
- Scores (3 subjects x 2 terms) for each student

2. Notes
- Uses ON CONFLICT DO NOTHING so re-running is safe.
- IDs are referenced via CTEs so we don't hardcode UUIDs.
*/

-- Classes (grade_level 1 = lowest, 6 = highest)
INSERT INTO classes (name, code, instructor, grade_level, capacity) VALUES
  ('MATHEMATICS', 'MATH', 'SIR RICHARD OWUSU', 1, 40),
  ('ENGLISH LANGUAGE', 'ENG', 'SIR TERRANCE KUSI', 1, 45),
  ('INTEGRATED SCIENCE', 'INT SCI', 'DESMOND TORDJIS', 2, 50),
  ('SOCIAL STUDIES', 'SO ST', 'CLEMENT BOTENG', 3, 40),
  ('ASANTE TWI', 'AST', 'SHANTUNG', 4, 40),
  ('BASIC DESIGN & TECHNOLOGY', 'BDT', 'MR. OBRI-YEBOAH', 4, 45),
  ('FRENCH LANGUAGE', 'FRLA', 'MONSIEUR', 5, 35),
  ('RELIGIOUS & MORAL EDUCATION', 'RME', 'SIR MARTIN', 6, 40)
ON CONFLICT DO NOTHING;

-- Students
INSERT INTO students (name, email, class_id, status) VALUES
  ('Amara Okafor', 'amara.okafor@scholar.edu', (SELECT id FROM classes WHERE code = 'CS 301'), 'Honors'),
  ('Liam Chen', 'liam.chen@scholar.edu', (SELECT id FROM classes WHERE code = 'MATH 240'), 'Active'),
  ('Sofia Marquez', 'sofia.marquez@scholar.edu', (SELECT id FROM classes WHERE code = 'BIO 401'), 'Honors'),
  ('Noah Williams', 'noah.williams@scholar.edu', (SELECT id FROM classes WHERE code = 'MATH 120'), 'At Risk'),
  ('Priya Patel', 'priya.patel@scholar.edu', (SELECT id FROM classes WHERE code = 'CS 310'), 'Active'),
  ('Ethan Brooks', 'ethan.brooks@scholar.edu', (SELECT id FROM classes WHERE code = 'CS 420'), 'Active'),
  ('Mia Johnson', 'mia.johnson@scholar.edu', (SELECT id FROM classes WHERE code = 'CS 101'), 'Active'),
  ('Lucas Silva', 'lucas.silva@scholar.edu', (SELECT id FROM classes WHERE code = 'CS 110'), 'Active'),
  ('Olivia Brown', 'olivia.brown@scholar.edu', (SELECT id FROM classes WHERE code = 'CS 301'), 'Honors'),
  ('Daniel Kim', 'daniel.kim@scholar.edu', (SELECT id FROM classes WHERE code = 'MATH 240'), 'Active'),
  ('Ava Martinez', 'ava.martinez@scholar.edu', (SELECT id FROM classes WHERE code = 'BIO 401'), 'Active'),
  ('James Wilson', 'james.wilson@scholar.edu', (SELECT id FROM classes WHERE code = 'CS 310'), 'At Risk')
ON CONFLICT DO NOTHING;

-- Scores: 3 subjects x 2 terms per student
-- We insert via a cross join of students and subject/term pairs.
INSERT INTO scores (student_id, subject, term, score)
SELECT s.id, v.subject, v.term, v.score
FROM students s
CROSS JOIN (VALUES
  ('Subject A', 'Term 1', 78),
  ('Subject A', 'Term 2', 82),
  ('Subject B', 'Term 1', 85),
  ('Subject B', 'Term 2', 88),
  ('Subject C', 'Term 1', 90),
  ('Subject C', 'Term 2', 92)
) AS v(subject, term, score)
ON CONFLICT (student_id, subject, term) DO NOTHING;
