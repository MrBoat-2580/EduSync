import { useEffect, useState } from 'react';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StudentCard from '../components/StudentCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { fetchStudentsByClass, fetchClasses, createStudent } from '../lib/api';
import type { StudentWithClass, ClassWithCount } from '../lib/supabase';
import { useRouter } from '../hooks/useRouter';
import { useToast } from '../hooks/useToast';
import { classLevelLabel } from '../utils/academic';

type ClassDetailsProps = {
  id: string;
};

export default function ClassDetails({ id }: ClassDetailsProps) {
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [classInfo, setClassInfo] = useState<ClassWithCount | null>(null);
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const allClasses = await fetchClasses();
      const cls = allClasses.find((c) => c.id === id) ?? null;
      setClassInfo(cls);
      const studs = await fetchStudentsByClass(id);
      setStudents(studs);
    } catch {
      notify('Failed to load class', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const status = String(form.get('status') ?? 'Active') as 'Active' | 'At Risk' | 'Honors';

    if (!name || !email) {
      notify('Name and email are required', 'error');
      return;
    }

    setSaving(true);
    try {
      await createStudent({ name, email, class_id: id, status });
      notify('Student added to class');
      setModalOpen(false);
      await load();
    } catch {
      notify('Failed to add student', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="display text-2xl font-bold text-ink-900">Class not found</h1>
        <Button className="mt-6" onClick={() => navigate({ name: 'classes' })}>
          Back to Classes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate({ name: 'classes' })}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Classes
      </button>

      <PageHeader
        title={classInfo.name}
        description={`${classInfo.code} · ${classLevelLabel(classInfo.grade_level)} · ${classInfo.instructor}`}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">Enrolled</p>
          <p className="display mt-1 text-2xl font-bold text-ink-900">{students.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">Capacity</p>
          <p className="display mt-1 text-2xl font-bold text-ink-900">{classInfo.capacity}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">Honors</p>
          <p className="display mt-1 text-2xl font-bold text-emerald-600">
            {students.filter((s) => s.status === 'Honors').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">At Risk</p>
          <p className="display mt-1 text-2xl font-bold text-rose-600">
            {students.filter((s) => s.status === 'At Risk').length}
          </p>
        </div>
      </div>

      <section>
        <h2 className="display mb-4 text-lg font-bold text-ink-900">Enrolled Students</h2>
        {students.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {students.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
        ) : (
          <div className="card">
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No students enrolled"
              description="Add students to this class to see them here."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </Button>
              }
            />
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Student to Class"
        description={`Enroll a new student in ${classInfo.code}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-student-form" disabled={saving}>
              {saving ? 'Saving...' : 'Add Student'}
            </Button>
          </>
        }
      >
        <form id="add-student-form" onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="e.g. Jane Doe"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="e.g. jane@scholar.edu"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Status</label>
            <select
              name="status"
              defaultValue="Active"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="Active">Active</option>
              <option value="At Risk">At Risk</option>
              <option value="Honors">Honors</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
