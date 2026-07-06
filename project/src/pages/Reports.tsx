import { useEffect, useState } from 'react';
import { Printer, FileText, Search, GraduationCap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { fetchStudents, fetchStudentById, fetchScoresByStudent } from '../lib/api';
import type { StudentWithClass, ScoreRow } from '../lib/supabase';
import {
  scoreToLetter,
  scoreColor,
  averageScore,
  scoreToGpa,
  groupByTerm,
} from '../utils/academic';
import { useToast } from '../hooks/useToast';

export default function Reports() {
  const { notify } = useToast();
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentWithClass | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchStudents();
        setStudents(data);
      } catch {
        notify('Failed to load students', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectStudent = async (id: string) => {
    setSelectedId(id);
    setLoadingReport(true);
    try {
      const [s, sc] = await Promise.all([fetchStudentById(id), fetchScoresByStudent(id)]);
      setStudent(s);
      setScores(sc);
    } catch {
      notify('Failed to load report', 'error');
    } finally {
      setLoadingReport(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()),
  );

  const handlePrint = () => window.print();

  const avg = averageScore(scores);
  const gpa = scoreToGpa(avg);
  const byTerm = groupByTerm(scores);
  const terms = Object.keys(byTerm).sort();
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Terminal Reports"
        description="Select a student to view and print their terminal report."
        actions={
          selectedId && student ? (
            <Button onClick={handlePrint} className="no-print">
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Student picker */}
        <div className="no-print">
          <div className="card overflow-hidden">
            <div className="border-b border-ink-100 p-4">
              <h2 className="display text-sm font-bold text-ink-900">Select Student</h2>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : filteredStudents.length > 0 ? (
                <ul className="divide-y divide-ink-100">
                  {filteredStudents.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => selectStudent(s.id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedId === s.id ? 'bg-brand-50' : 'hover:bg-ink-50'
                        }`}
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                          {s.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">{s.name}</p>
                          <p className="truncate text-xs text-ink-500">
                            {s.class?.code ?? 'No class'}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<FileText className="h-6 w-6" />}
                  title="No students"
                  description="No students match your search."
                />
              )}
            </div>
          </div>
        </div>

        {/* Report preview */}
        <div>
          {!selectedId ? (
            <div className="card">
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No student selected"
                description="Pick a student from the list to preview their terminal report."
              />
            </div>
          ) : loadingReport ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : !student ? (
            <div className="card">
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="Student not found"
                description="This student could not be loaded."
              />
            </div>
          ) : (
            <div className="card print-area p-8">
              {/* Report header */}
              <div className="flex items-center justify-between border-b-2 border-ink-900 pb-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="display text-xl font-bold text-ink-900">TRINITY EDUCATIONAL COMPLEX</h1>
                    <p className="text-xs text-ink-500">Terminal Academic Report</p>
                  </div>
                </div>
                <div className="text-right text-xs text-ink-500">
                  <p>Issued: {today}</p>
                  <p>Report ID: {student.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Student info */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Info label="Student Name" value={student.name} />
                <Info label="Email" value={student.email} />
                <Info
                  label="Class"
                  value={student.class ? `${student.class.code}` : 'Unassigned'}
                />
                <Info
                  label="Grade Level"
                  value={student.class ? `Grade ${student.class.grade_level}` : '—'}
                />
              </div>

              {/* Summary stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SummaryCard label="Average Score" value={scores.length ? `${avg}%` : '—'} />
                <SummaryCard label="Grade" value={scores.length ? scoreToLetter(avg) : '—'} />
                <SummaryCard label="GPA" value={scores.length ? gpa.toFixed(2) : '—'} />
                <SummaryCard label="Status" value={student.status} />
              </div>

              {/* Scores table */}
              <div className="mt-8">
                <h2 className="display text-base font-bold text-ink-900">Subject Scores</h2>
                {scores.length === 0 ? (
                  <p className="mt-3 rounded-xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
                    No scores recorded for this student.
                  </p>
                ) : (
                  <div className="mt-4 space-y-6">
                    {terms.map((term) => (
                      <div key={term}>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-500">
                          {term}
                        </h3>
                        <table className="w-full overflow-hidden rounded-xl border border-ink-200 text-sm">
                          <thead>
                            <tr className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                              <th className="px-4 py-2.5 font-semibold">Subject</th>
                              <th className="px-4 py-2.5 text-center font-semibold">Score</th>
                              <th className="px-4 py-2.5 text-center font-semibold">Grade</th>
                              <th className="px-4 py-2.5 text-center font-semibold">Remark</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink-100">
                            {byTerm[term].map((sc) => (
                              <tr key={sc.id}>
                                <td className="px-4 py-2.5 font-medium text-ink-900">{sc.subject}</td>
                                <td className="px-4 py-2.5 text-center font-semibold text-ink-900">
                                  {sc.score}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className={`font-bold ${scoreColor(sc.score)}`}>
                                    {scoreToLetter(sc.score)}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-center text-ink-600">
                                  {remark(sc.score)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Overall remark + signatures */}
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl bg-ink-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Overall Remark
                  </p>
                  <p className="mt-2 text-sm text-ink-700">
                    {scores.length
                      ? overallRemark(avg, student.status)
                      : 'No scores recorded yet.'}
                  </p>
                </div>
                <div className="rounded-xl border border-ink-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Class Teacher's Signature
                  </p>
                  <div className="mt-8 border-t border-dashed border-ink-300 pt-1">
                    <p className="text-xs text-ink-400">Class Instructor</p>
                  </div>
                </div>
              </div>

              {/* Print-only footer */}
              <p className="mt-8 text-center text-[10px] text-ink-400">
                This report was generated by TRINITY EDUCATIONAL COMPLEX Admin System on {today}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function remark(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Pass';
  return 'Needs Improvement';
}

function overallRemark(avg: number, status: string): string {
  if (status === 'Honors') return 'Outstanding performance. Keep up the excellent work!';
  if (avg >= 80) return 'Strong performance across subjects. Well done.';
  if (avg >= 70) return 'Good progress. Continue to work hard.';
  if (avg >= 60) return 'Satisfactory. Focus on weaker subjects to improve.';
  return 'Additional support recommended. Please meet with academic advisor.';
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-900">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="display mt-1 text-lg font-bold text-ink-900">{value}</p>
    </div>
  );
}
