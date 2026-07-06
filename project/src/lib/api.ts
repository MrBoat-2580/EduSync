import { supabase, type ClassRow, type ClassWithCount, type ScoreRow, type StudentRow, type StudentWithClass } from './supabase';

// ---- Classes ----

export async function fetchClasses(): Promise<ClassWithCount[]> {
  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .order('grade_level', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  if (!classes) return [];

  // Fetch student counts per class in one query.
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
  const { data, error } = await supabase.from('classes').insert(input).select().single();
  if (error) throw error;
  return data as ClassRow;
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await supabase.from('classes').delete().eq('id', id);
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
  // Try insert; on unique conflict, update the score.
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
