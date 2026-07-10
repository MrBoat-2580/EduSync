import { useEffect, useMemo, useState } from 'react';
import { UserPlus, Search, Users, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import {
  fetchStudents,
  fetchClasses,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../lib/api';
import type { StudentWithClass, ClassRow } from '../lib/supabase';
import { classLevelLabel, statusStyles } from '../utils/academic';
import { useRouter } from '../hooks/useRouter';
import { useToast } from '../hooks/useToast';

export default function Students() {
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'At Risk' | 'Honors'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentWithClass | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [studs, cls] = await Promise.all([fetchStudents(), fetchClasses()]);
      setStudents(studs);
      setClasses(cls);
    } catch {
      notify('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [students, query, statusFilter]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (student: StudentWithClass) => {
    setEditing(student);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const class_id = String(form.get('class_id') ?? '') || null;
    const status = String(form.get('status') ?? 'Active') as 'Active' | 'At Risk' | 'Honors';

    if (!name || !email) {
      notify('Name and email are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateStudent(editing.id, { name, email, class_id, status });
        notify('Student updated');
      } else {
        await createStudent({ name, email, class_id, status });
        notify('Student added');
      }
      setModalOpen(false);
      await load();
    } catch {
      notify('Failed to save student', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student? This will also remove all their scores.')) return;
    setDeletingId(id);
    try {
      await deleteStudent(id);
      notify('Student deleted');
      await load();
    } catch {
      notify('Failed to delete student', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Students"
        description="View, add, and manage all enrolled students."
        actions={
          <Button onClick={openAdd}>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        }
      />

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'Active', 'Honors', 'At Risk'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-500">
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Class</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((s) => {
                  const initials = s.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('');
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-ink-50">
                      <td className="px-5 py-3">
                        <button
                          onClick={() => navigate({ name: 'student', id: s.id })}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-900 hover:text-brand-600">{s.name}</p>
                            <p className="text-xs text-ink-500">{s.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-ink-600">
                        {s.class ? (
                          <span>
                            {s.class.code}
                            <span className="block text-xs text-ink-400">{classLevelLabel(s.class.grade_level)}</span>
                          </span>
                        ) : (
                          <span className="text-ink-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles(
                            s.status,
                          )}`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={deletingId === s.id}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No students found"
            description="Add your first student or adjust your search."
            action={
              <Button onClick={openAdd}>
                <UserPlus className="h-4 w-4" />
                Add Student
              </Button>
            }
          />
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Student' : 'Add Student'}
        description={editing ? 'Update student information.' : 'Create a new student record.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="student-form" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Student'}
            </Button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              name="name"
              required
              defaultValue={editing?.name}
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
              defaultValue={editing?.email}
              placeholder="e.g. jane@scholar.edu"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Class</label>
            <select
              name="class_id"
              defaultValue={editing?.class_id ?? ''}
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Unassigned</option>
              {classes
                .sort((a, b) => a.grade_level - b.grade_level)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({classLevelLabel(c.grade_level)})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Status</label>
            <select
              name="status"
              defaultValue={editing?.status ?? 'Active'}
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
