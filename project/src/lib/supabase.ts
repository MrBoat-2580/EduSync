import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

// Database row types — mirror the schema in src/data/types.ts.
export type ClassRow = {
  id: string;
  name: string;
  code: string;
  instructor: string;
  grade_level: number;
  capacity: number;
  created_at: string;
};

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  class_id: string | null;
  status: 'Active' | 'At Risk' | 'Honors';
  created_at: string;
};

export type ScoreRow = {
  id: string;
  student_id: string;
  subject: string;
  term: string;
  score: number;
  created_at: string;
};

// Student joined with its class + scores (used by the frontend).
export type StudentWithClass = StudentRow & {
  class: Pick<ClassRow, 'id' | 'name' | 'code' | 'grade_level'> | null;
};

export type ClassWithCount = ClassRow & {
  student_count: number;
};
