import { useEffect, useMemo, useState } from 'react';
import { Plus, BookOpen, Search, PencilLine, Settings2, School } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ClassCard from '../components/ClassCard';
import SubjectCard from '../components/SubjectCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { fetchClasses, createClass, updateClass, fetchSubjects, createSubject, updateSubject } from '../lib/api';
import type { ClassWithCount, SubjectRow } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { useSchoolSettings } from '../context/SchoolSettings';
import { classLevelLabel } from '../utils/academic';

const gradeLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export default function Classes() {
  const { notify } = useToast();
  const { openSettings } = useSchoolSettings();
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithCount | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [classData, subjectData] = await Promise.all([fetchClasses(), fetchSubjects()]);
      setClasses(classData);
      setSubjects(subjectData);
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

    if (!name || !code || !instructor || !grade_level || !capacity) {
      notify('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingClass) {
        await updateClass(editingClass.id, { name, code, instructor, grade_level, capacity });
        notify('Class updated successfully');
      } else {
        await createClass({ name, code, instructor, grade_level, capacity });
        notify('Class created successfully');
      }
      setModalOpen(false);
      setEditingClass(null);
      await load();
    } catch {
      notify(editingClass ? 'Failed to update class' : 'Failed to create class', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('subject_name') ?? '').trim();
    const instructor = String(form.get('subject_instructor') ?? '').trim();
    const class_level = Number(form.get('subject_class_level'));

    if (!name || !instructor || !class_level) {
      notify('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, { name, instructor, class_level });
        notify('Subject updated successfully');
      } else {
        await createSubject({ name, instructor, class_level });
        notify('Subject created successfully');
      }
      setSubjectModalOpen(false);
      setEditingSubject(null);
      await load();
    } catch {
      notify(editingSubject ? 'Failed to update subject' : 'Failed to create subject', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditClass = (classItem: ClassWithCount) => {
    setEditingClass(classItem);
    setModalOpen(true);
  };

  const openEditSubject = (subject: SubjectRow) => {
    setEditingSubject(subject);
    setSubjectModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Classes"
        description="Manage Ghanaian school levels from Nursery to JHS 3 with class capacity controls."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openSettings}>
              <Settings2 className="h-4 w-4" />
              Settings
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </div>
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
            All Levels
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
              {classLevelLabel(g)}
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
            <div key={c.id} className="relative">
              <button
                onClick={() => openEditClass(c)}
                className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border border-ink-200/70 bg-white text-ink-500 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-600"
                aria-label="Edit class"
              >
                <PencilLine className="h-4 w-4" />
              </button>
              <ClassCard classItem={c} />
            </div>
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display text-lg font-bold text-ink-900">Subjects & Instructors</h2>
            <p className="text-sm text-ink-500">Assign subjects to instructors and manage the school curriculum.</p>
          </div>
          <Button onClick={() => setSubjectModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={{
                  id: subject.id,
                  name: subject.name,
                  instructor: subject.instructor,
                  className: classLevelLabel(subject.class_level),
                }}
                onEdit={() => openEditSubject(subject)}
              />
            ))}
          </div>
        ) : (
          <div className="card">
            <EmptyState
              icon={<School className="h-6 w-6" />}
              title="No subjects yet"
              description="Create a subject and assign it to an instructor."
            />
          </div>
        )}
      </section>

      {/* Add Class modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingClass(null);
        }}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
        description={editingClass ? 'Update the class name, instructor, and capacity.' : 'Create a Ghanaian school class with a 100-student capacity.'}
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setModalOpen(false);
              setEditingClass(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" form="add-class-form" disabled={saving}>
              {saving ? 'Saving...' : editingClass ? 'Save Changes' : 'Create Class'}
            </Button>
          </>
        }
      >
        <form id="add-class-form" onSubmit={handleCreate} className="space-y-4">
          <Field label="Class Name" name="name" placeholder="e.g. JHS 3" required defaultValue={editingClass?.name} />
          <Field label="Class Code" name="code" placeholder="e.g. J3" required defaultValue={editingClass?.code} />
          <Field label="Instructor" name="instructor" placeholder="e.g. Mrs. Evelyn Quaye" required defaultValue={editingClass?.instructor} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink-700">School Level</label>
              <select
                name="grade_level"
                defaultValue={editingClass?.grade_level ?? 1}
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {gradeLevels.map((g) => (
                  <option key={g} value={g}>
                    {classLevelLabel(g)}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Capacity" name="capacity" type="number" placeholder="100" defaultValue={editingClass?.capacity ?? 100} />
          </div>
        </form>
      </Modal>

      <Modal
        open={subjectModalOpen}
        onClose={() => {
          setSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        description={editingSubject ? 'Update the subject and instructor.' : 'Create a subject and assign an instructor.'}
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setSubjectModalOpen(false);
              setEditingSubject(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" form="subject-form" disabled={saving}>
              {saving ? 'Saving...' : editingSubject ? 'Save Changes' : 'Add Subject'}
            </Button>
          </>
        }
      >
        <form id="subject-form" onSubmit={handleSubjectSave} className="space-y-4">
          <Field label="Subject Name" name="subject_name" placeholder="e.g. Mathematics" required defaultValue={editingSubject?.name} />
          <Field label="Instructor" name="subject_instructor" placeholder="e.g. Mr. Kwame Boateng" required defaultValue={editingSubject?.instructor} />
          <div>
            <label className="text-sm font-medium text-ink-700">Class Level</label>
            <select
              name="subject_class_level"
              defaultValue={editingSubject?.class_level ?? 1}
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {classLevelLabel(g)}
                </option>
              ))}
            </select>
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
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
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
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
