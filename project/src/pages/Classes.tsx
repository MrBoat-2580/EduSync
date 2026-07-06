import { useEffect, useMemo, useState } from 'react';
import { Plus, BookOpen, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ClassCard from '../components/ClassCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { fetchClasses, createClass } from '../lib/api';
import type { ClassWithCount } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

const gradeLevels = [1, 2, 3, 4, 5, 6];

export default function Classes() {
  const { notify } = useToast();
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch {
      notify('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const matchesGrade = gradeFilter === 'all' || c.grade_level === gradeFilter;
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.instructor.toLowerCase().includes(query.toLowerCase());
      return matchesGrade && matchesQuery;
    });
  }, [classes, gradeFilter, query]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const code = String(form.get('code') ?? '').trim();
    const instructor = String(form.get('instructor') ?? '').trim();
    const grade_level = Number(form.get('grade_level'));
    const capacity = Number(form.get('capacity'));

    if (!name || !code || !instructor) {
      notify('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      await createClass({ name, code, instructor, grade_level, capacity });
      notify('Class created successfully');
      setModalOpen(false);
      await load();
    } catch {
      notify('Failed to create class', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Classes"
        description="Browse classes by grade level, from lower to upper."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Class
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
            placeholder="Search classes..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGradeFilter('all')}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              gradeFilter === 'all'
                ? 'bg-brand-600 text-white'
                : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
            }`}
          >
            All Grades
          </button>
          {gradeLevels.map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                gradeFilter === g
                  ? 'bg-brand-600 text-white'
                  : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
              }`}
            >
              Grade {g}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ClassCard key={c.id} classItem={c} />
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No classes found"
            description="Try adjusting your filter, or add a new class."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Class
              </Button>
            }
          />
        </div>
      )}

      {/* Add Class modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Class"
        description="Create a class and assign it to a grade level."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-class-form" disabled={saving}>
              {saving ? 'Saving...' : 'Create Class'}
            </Button>
          </>
        }
      >
        <form id="add-class-form" onSubmit={handleCreate} className="space-y-4">
          <Field label="Class Name" name="name" placeholder="e.g. Algorithms" required />
          <Field label="Class Code" name="code" placeholder="e.g. CS 301" required />
          <Field label="Instructor" name="instructor" placeholder="e.g. Dr. Tanaka" required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink-700">Grade Level</label>
              <select
                name="grade_level"
                defaultValue={1}
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {gradeLevels.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Capacity" name="capacity" type="number" placeholder="40" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
