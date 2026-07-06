import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Mail,
  BookOpen,
  Plus,
  Trash2,
  Printer,
} from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ProgressRing from '../components/ProgressRing';
import EmptyState from '../components/EmptyState';
import {
  fetchStudentById,
  fetchScoresByStudent,
  upsertScore,
  deleteScore,
} from '../lib/api';
import type { StudentWithClass, ScoreRow } from '../lib/supabase';
import {
  scoreToLetter,
  scoreColor,
  scoreBg,
  averageScore,
  scoreToGpa,
  statusStyles,
  groupByTerm,
} from '../utils/academic';
import { useRouter } from '../hooks/useRouter';
import { useToast } from '../hooks/useToast';

type StudentDetailsProps = {
  id: string;
};

const TERMS = ['Term 1', 'Term 2', 'Term 3'];

export default function StudentDetails({ id }: StudentDetailsProps) {
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [student, setStudent] = useState<StudentWithClass | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, sc] = await Promise.all([fetchStudentById(id), fetchScoresByStudent(id)]);
      setStudent(s);
      setScores(sc);
    } catch {
      notify('Failed to load student', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddScore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const subject = String(form.get('subject') ?? '').trim();
    const term = String(form.get('term') ?? 'Term 1');
    const score = Number(form.get('score'));

    if (!subject) {
      notify('Subject is required', 'error');
      return;
    }
    if (Number.isNaN(score) || score < 0 || score > 100) {
      notify('Score must be between 0 and 100', 'error');
      return;
    }

    setSaving(true);
    try {
      await upsertScore({ student_id: id, subject, term, score });
      notify('Score saved');
      setModalOpen(false);
      await load();
    } catch {
      notify('Failed to save score', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    try {
      await deleteScore(scoreId);
      notify('Score deleted');
      await load();
    } catch {
      notify('Failed to delete score', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="display text-2xl font-bold text-ink-900">Student not found</h1>
        <Button className="mt-6" onClick={() => navigate({ name: 'students' })}>
          Back to Students
        </Button>
      </div>
    );
  }

  const avg = averageScore(scores);
  const gpa = scoreToGpa(avg);
  const byTerm = groupByTerm(scores);
  const terms = Object.keys(byTerm).sort();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ name: 'students' })}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>
        <Button variant="outline" onClick={() => navigate({ name: 'reports' })}>
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Profile header */}
      <section className="card overflow-hidden animate-fade-in">
        <div className="h-20 bg-gradient-to-r from-brand-600 via-brand-500 to-violet-500" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-2xl font-bold text-brand-700 ring-4 ring-white">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="pb-1">
                <h1 className="display text-2xl font-bold text-ink-900">{student.name}</h1>
                <p className="text-sm text-ink-500">{student.email}</p>
              </div>
            </div>
            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${statusStyles(
                student.status,
              )}`}
            >
              {student.status}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-600">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-ink-400" />
              {student.email}
            </p>
            <p className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-ink-400" />
              {student.class
                ? `${student.class.code} — ${student.class.name} (Grade ${student.class.grade_level})`
                : 'No class assigned'}
            </p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card flex flex-col items-center justify-center p-6">
          <h2 className="display text-base font-bold text-ink-900">Average Score</h2>
          <div className="mt-4">
            <ProgressRing
              value={avg}
              size={140}
              label={scores.length ? scoreToLetter(avg) : '—'}
              sublabel={scores.length ? `${avg}/100` : 'No scores'}
              color={
                avg >= 90
                  ? 'stroke-emerald-500'
                  : avg >= 80
                    ? 'stroke-brand-500'
                    : avg >= 70
                      ? 'stroke-amber-500'
                      : 'stroke-rose-500'
              }
            />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="display text-base font-bold text-ink-900">Quick Stats</h2>
          <dl className="mt-4 space-y-4">
            <Stat label="GPA (estimated)" value={scores.length ? gpa.toFixed(2) : '—'} />
            <Stat label="Scores Recorded" value={scores.length} />
            <Stat label="Subjects" value={new Set(scores.map((s) => s.subject)).size} />
            <Stat label="Terms" value={terms.length} />
          </dl>
        </section>

        <section className="card flex flex-col p-6">
          <h2 className="display text-base font-bold text-ink-900">Actions</h2>
          <p className="mt-1 text-sm text-ink-500">Record and manage student scores.</p>
          <Button className="mt-4 w-full" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Score
          </Button>
        </section>
      </div>

      {/* Scores by term */}
      <section className="card p-6">
        <h2 className="display text-lg font-bold text-ink-900">Scores by Term</h2>
        <p className="text-sm text-ink-500">All recorded scores across terms.</p>

        {scores.length === 0 ? (
          <EmptyState
            icon={<Plus className="h-6 w-6" />}
            title="No scores recorded"
            description="Add the first score for this student."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Score
              </Button>
            }
          />
        ) : (
          <div className="mt-6 space-y-8">
            {terms.map((term) => (
              <div key={term}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
                  {term}
                </h3>
                <div className="space-y-2">
                  {byTerm[term].map((sc) => (
                    <div
                      key={sc.id}
                      className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-ink-900">{sc.subject}</span>
                          <span className="text-xs text-ink-500">{sc.term}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-ink-200">
                            <div
                              className={`h-full rounded-full ${scoreBg(sc.score)}`}
                              style={{ width: `${sc.score}%` }}
                            />
                          </div>
                          <span className={`display w-12 text-right font-bold ${scoreColor(sc.score)}`}>
                            {sc.score}
                          </span>
                          <span className={`w-6 text-center text-sm font-semibold ${scoreColor(sc.score)}`}>
                            {scoreToLetter(sc.score)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteScore(sc.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete score"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Score modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Score"
        description="Record a score for a subject and term."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="score-form" disabled={saving}>
              {saving ? 'Saving...' : 'Save Score'}
            </Button>
          </>
        }
      >
        <form id="score-form" onSubmit={handleAddScore} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              name="subject"
              required
              placeholder="e.g. Mathematics"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink-700">Term</label>
              <select
                name="term"
                defaultValue="Term 1"
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">
                Score (0-100) <span className="text-rose-500">*</span>
              </label>
              <input
                name="score"
                type="number"
                min={0}
                max={100}
                required
                defaultValue={80}
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="display font-bold text-ink-900">{value}</dd>
    </div>
  );
}
