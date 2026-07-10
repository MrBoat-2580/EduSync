import { supabase, type ClassRow, type ClassWithCount, type ScoreRow, type StudentRow, type StudentWithClass, type SubjectRow, isSupabaseConfigured } from './supabase';

const localClasses: ClassRow[] = [
  { id: 'class-nursery-1', name: 'Nursery 1', code: 'N1', instructor: 'Mrs. Amina Boateng', grade_level: 1, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-nursery-2', name: 'Nursery 2', code: 'N2', instructor: 'Ms. Grace Asare', grade_level: 2, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-kindergarten-1', name: 'Kindergarten 1', code: 'KG1', instructor: 'Mr. Daniel Osei', grade_level: 3, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-kindergarten-2', name: 'Kindergarten 2', code: 'KG2', instructor: 'Mrs. Rita Kusi', grade_level: 4, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-primary-1', name: 'Primary 1', code: 'P1', instructor: 'Mr. Kwame Boateng', grade_level: 5, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-primary-2', name: 'Primary 2', code: 'P2', instructor: 'Ms. Felicity Addo', grade_level: 6, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-primary-3', name: 'Primary 3', code: 'P3', instructor: 'Mrs. Naomi Mensah', grade_level: 7, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-primary-4', name: 'Primary 4', code: 'P4', instructor: 'Mr. Kofi Ansah', grade_level: 8, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-primary-5', name: 'Primary 5', code: 'P5', instructor: 'Mrs. Selorm Dzebu', grade_level: 9, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-primary-6', name: 'Primary 6', code: 'P6', instructor: 'Mr. Emmanuel Tetteh', grade_level: 10, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-jhs-1', name: 'JHS 1', code: 'J1', instructor: 'Mrs. Abena Owusu', grade_level: 11, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-jhs-2', name: 'JHS 2', code: 'J2', instructor: 'Mr. Bright Amponsah', grade_level: 12, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'class-jhs-3', name: 'JHS 3', code: 'J3', instructor: 'Mrs. Evelyn Quaye', grade_level: 13, capacity: 100, created_at: '2026-01-01T00:00:00.000Z' },
];

const localSubjects: SubjectRow[] = [
  { id: 'subject-math', name: 'Mathematics', instructor: 'Mr. Kwame Boateng', class_level: 5, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'subject-english', name: 'English Language', instructor: 'Ms. Felicity Addo', class_level: 6, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'subject-science', name: 'Science', instructor: 'Mrs. Naomi Mensah', class_level: 7, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'subject-social-studies', name: 'Social Studies', instructor: 'Mr. Kofi Ansah', class_level: 8, created_at: '2026-01-01T00:00:00.000Z' },
];

const classStorageKey = 'academic-dashboard-classes';
const subjectStorageKey = 'academic-dashboard-subjects';

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureLocalState() {
  const stored = readLocal<ClassRow[]>(classStorageKey, []);
  if (stored.length === 0) {
    writeLocal(classStorageKey, localClasses);
  }
  const storedSubjects = readLocal<SubjectRow[]>(subjectStorageKey, []);
  if (storedSubjects.length === 0) {
    writeLocal(subjectStorageKey, localSubjects);
  }
}

ensureLocalState();

// ---- Classes ----

export async function fetchClasses(): Promise<ClassWithCount[]> {
  if (!isSupabaseConfigured) {
    const classes = readLocal<ClassRow[]>(classStorageKey, localClasses);
    return classes.map((c) => ({ ...c, student_count: 0 }));
  }

  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .order('grade_level', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  if (!classes) return [];

  const { data: counts, error: countError } = await supabase
    .from('students')
    .select('class_id');
  if (countError) throw countError;

  const countMap = new Map<string, number>();
  (counts ?? []).forEach((row: { class_id: string | null }) => {
    if (row.class_id) countMap.set(row.class_id, (countMap.get(row.class_id) ?? 0) + 1);
  });

  return (classes as ClassRow[]).map((c) => ({
    ...c,
    student_count: countMap.get(c.id) ?? 0,
  }));
}

export async function createClass(input: {
  name: string;
  code: string;
  instructor: string;
  grade_level: number;
  capacity: number;
}): Promise<ClassRow> {
  if (!isSupabaseConfigured) {
    const classes = readLocal<ClassRow[]>(classStorageKey, localClasses);
    const next: ClassRow = {
      id: `class-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...input,
    };
    const updated = [...classes, next].sort((a, b) => a.grade_level - b.grade_level || a.name.localeCompare(b.name));
    writeLocal(classStorageKey, updated);
    return next;
  }

  const { data, error } = await supabase.from('classes').insert(input).select().single();
  if (error) throw error;
  return data as ClassRow;
}

export async function updateClass(id: string, input: Partial<ClassRow>): Promise<ClassRow> {
  if (!isSupabaseConfigured) {
    const classes = readLocal<ClassRow[]>(classStorageKey, localClasses);
    const index = classes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Class not found');
    const updated = [...classes];
    updated[index] = { ...updated[index], ...input };
    writeLocal(classStorageKey, updated);
    return updated[index];
  }

  const { data, error } = await supabase.from('classes').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as ClassRow;
}

export async function deleteClass(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const classes = readLocal<ClassRow[]>(classStorageKey, localClasses);
    writeLocal(classStorageKey, classes.filter((c) => c.id !== id));
    return;
  }
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchSubjects(): Promise<SubjectRow[]> {
  if (!isSupabaseConfigured) {
    return readLocal<SubjectRow[]>(subjectStorageKey, localSubjects);
  }

  const { data, error } = await supabase.from('subjects').select('*').order('class_level', { ascending: true });
  if (error) throw error;
  return (data ?? []) as SubjectRow[];
}

export async function createSubject(input: { name: string; instructor: string; class_level: number }): Promise<SubjectRow> {
  if (!isSupabaseConfigured) {
    const subject = {
      id: `subject-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...input,
    };
    const subjects = [...readLocal<SubjectRow[]>(subjectStorageKey, localSubjects), subject];
    writeLocal(subjectStorageKey, subjects);
    return subject;
  }

  const { data, error } = await supabase.from('subjects').insert(input).select().single();
  if (error) throw error;
  return data as SubjectRow;
}

export async function updateSubject(id: string, input: Partial<SubjectRow>): Promise<SubjectRow> {
  if (!isSupabaseConfigured) {
    const subjects = readLocal<SubjectRow[]>(subjectStorageKey, localSubjects);
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Subject not found');
    const updated = [...subjects];
    updated[index] = { ...updated[index], ...input };
    writeLocal(subjectStorageKey, updated);
    return updated[index];
  }

  const { data, error } = await supabase.from('subjects').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as SubjectRow;
}

export async function deleteSubject(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const subjects = readLocal<SubjectRow[]>(subjectStorageKey, localSubjects);
    writeLocal(subjectStorageKey, subjects.filter((s) => s.id !== id));
    return;
  }

  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}

// ---- Students ----

export async function fetchStudents(): Promise<StudentWithClass[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*, class:classes(id, name, code, grade_level)')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as StudentWithClass[];
}

export async function fetchStudentsByClass(classId: string): Promise<StudentWithClass[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*, class:classes(id, name, code, grade_level)')
    .eq('class_id', classId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as StudentWithClass[];
}

export async function fetchStudentById(id: string): Promise<StudentWithClass | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*, class:classes(id, name, code, grade_level)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as StudentWithClass | null;
}

export async function createStudent(input: {
  name: string;
  email: string;
  class_id: string | null;
  status: 'Active' | 'At Risk' | 'Honors';
}): Promise<StudentRow> {
  const { data, error } = await supabase.from('students').insert(input).select().single();
  if (error) throw error;
  return data as StudentRow;
}

export async function updateStudent(
  id: string,
  input: Partial<Pick<StudentRow, 'name' | 'email' | 'class_id' | 'status'>>,
): Promise<StudentRow> {
  const { data, error } = await supabase.from('students').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as StudentRow;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

// ---- Scores ----

export async function fetchScoresByStudent(studentId: string): Promise<ScoreRow[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('student_id', studentId)
    .order('term', { ascending: true })
    .order('subject', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScoreRow[];
}

export async function upsertScore(input: {
  student_id: string;
  subject: string;
  term: string;
  score: number;
}): Promise<ScoreRow> {
  const { data, error } = await supabase
    .from('scores')
    .upsert(input, { onConflict: 'student_id,subject,term' })
    .select()
    .single();
  if (error) throw error;
  return data as ScoreRow;
}

export async function deleteScore(id: string): Promise<void> {
  const { error } = await supabase.from('scores').delete().eq('id', id);
  if (error) throw error;
}
