/*
# Create academic dashboard schema (admin, single-tenant)

This migration sets up the database for an administrator academic dashboard.
The admin can view and add students, manage classes organized by grade level
(lower to upper), record student scores per subject per term, and print
terminal reports.

1. New Tables
- `classes`
  - `id` (uuid, primary key)
  - `name` (text, not null) — e.g. "Algorithms & Data Structures"
  - `code` (text, not null) — e.g. "CS 301"
  - `instructor` (text, not null)
  - `grade_level` (int, not null) — 1 (lowest) to 6 (highest), used to order
    classes from lower to upper grade.
  - `capacity` (int, not null, default 40)
  - `created_at` (timestamptz)
- `students`
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `email` (text, not null)
  - `class_id` (uuid, foreign key -> classes.id, on delete set null)
  - `status` (text, not null, default 'Active') — 'Active' | 'At Risk' | 'Honors'
  - `created_at` (timestamptz)
- `scores`
  - `id` (uuid, primary key)
  - `student_id` (uuid, foreign key -> students.id, on delete cascade)
  - `subject` (text, not null)
  - `term` (text, not null) — e.g. 'Term 1' | 'Term 2' | 'Term 3'
  - `score` (int, not null, check 0-100)
  - `created_at` (timestamptz)
  - Unique constraint on (student_id, subject, term) so a student has one
    score per subject per term.

2. Security
- RLS enabled on all three tables.
- Single-tenant admin app (no sign-in): policies use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` because the data is intentionally
  shared and the app has no login screen.

3. Important Notes
- Grade levels: 1 = Grade 1, ..., 6 = Grade 6 (lower to upper).
- Scores are integers 0-100, enforced by a CHECK constraint.
- Deleting a student cascades to their scores.
- Deleting a class sets enrolled students' class_id to null (keeps student records).
*/

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  instructor text NOT NULL,
  grade_level int NOT NULL DEFAULT 1,
  capacity int NOT NULL DEFAULT 40,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  term text NOT NULL,
  score int NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, subject, term)
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- classes policies
DROP POLICY IF EXISTS "anon_select_classes" ON classes;
CREATE POLICY "anon_select_classes" ON classes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_classes" ON classes;
CREATE POLICY "anon_insert_classes" ON classes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_classes" ON classes;
CREATE POLICY "anon_update_classes" ON classes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_classes" ON classes;
CREATE POLICY "anon_delete_classes" ON classes FOR DELETE
  TO anon, authenticated USING (true);

-- students policies
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

-- scores policies
DROP POLICY IF EXISTS "anon_select_scores" ON scores;
CREATE POLICY "anon_select_scores" ON scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scores" ON scores;
CREATE POLICY "anon_insert_scores" ON scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scores" ON scores;
CREATE POLICY "anon_update_scores" ON scores FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scores" ON scores;
CREATE POLICY "anon_delete_scores" ON scores FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_scores_student_id ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade_level ON classes(grade_level);
