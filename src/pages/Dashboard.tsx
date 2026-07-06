import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ClassCard from '../components/ClassCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { fetchClasses, fetchStudents, fetchScoresByStudent } from '../lib/api';
import type { ClassWithCount, StudentWithClass } from '../lib/supabase';
import { useRouter } from '../hooks/useRouter';

export default function Dashboard() {
  const { navigate } = useRouter();
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [cls, studs] = await Promise.all([fetchClasses(), fetchStudents()]);
        if (cancelled) return;
        setClasses(cls);
        setStudents(studs);

        // Compute overall average score across all students.
        const allScores = await Promise.all(
          studs.map((s) => fetchScoresByStudent(s.id)),
        );
        if (cancelled) return;
        const flat = allScores.flat();
        setAvgScore(
          flat.length ? Math.round(flat.reduce((sum, sc) => sum + sc.score, 0) / flat.length) : 0,
        );
      } catch {
        // ignore — empty state will show
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const totalStudents = students.length;
  const totalClasses = classes.length;
  const atRisk = students.filter((s) => s.status === 'At Risk').length;
  const honors = students.filter((s) => s.status === 'Honors').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of students, classes, and academic performance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={<Users className="h-5 w-5" />}
          accent="from-brand-500 to-brand-700"
        />
        <StatCard
          label="Total Classes"
          value={totalClasses}
          icon={<BookOpen className="h-5 w-5" />}
          accent="from-sky-500 to-sky-700"
        />
        <StatCard
          label="Average Score"
          value={`${avgScore}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="from-emerald-500 to-emerald-700"
        />
        <StatCard
          label="At Risk"
          value={atRisk}
          icon={<GraduationCap className="h-5 w-5" />}
          accent="from-rose-500 to-rose-700"
        />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">Honors</p>
          <p className="display mt-2 text-3xl font-bold text-emerald-600">{honors}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">Active</p>
          <p className="display mt-2 text-3xl font-bold text-brand-600">
            {students.filter((s) => s.status === 'Active').length}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">At Risk</p>
          <p className="display mt-2 text-3xl font-bold text-rose-600">{atRisk}</p>
        </div>
      </div>

      {/* Classes by grade level */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="display text-lg font-bold text-ink-900">Classes by Grade Level</h2>
            <p className="text-sm text-ink-500">From lower to upper grades</p>
          </div>
          <button
            onClick={() => navigate({ name: 'classes' })}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {classes.slice(0, 6).map((c) => (
              <ClassCard key={c.id} classItem={c} />
            ))}
          </div>
        ) : (
          <div className="card">
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No classes yet"
              description="Add your first class to get started."
            />
          </div>
        )}
      </section>
    </div>
  );
}
