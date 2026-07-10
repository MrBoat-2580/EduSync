import { Users, ChevronRight } from 'lucide-react';
import type { ClassWithCount } from '../lib/supabase';
import { useRouter } from '../hooks/useRouter';
import { classLevelLabel } from '../utils/academic';

type ClassCardProps = {
  classItem: ClassWithCount;
};

export default function ClassCard({ classItem }: ClassCardProps) {
  const { navigate } = useRouter();
  const fillPct = Math.round((classItem.student_count / classItem.capacity) * 100);
  const isFull = classItem.student_count >= classItem.capacity;

  return (
    <button
      onClick={() => navigate({ name: 'class', id: classItem.id })}
      className="card card-hover group w-full p-5 text-left animate-fade-in-up"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {classItem.code} · {classLevelLabel(classItem.grade_level)}
          </span>
          <h3 className="display mt-1 font-semibold leading-snug text-ink-900">
            {classItem.name}
          </h3>
          <p className="mt-1 text-sm text-ink-500">{classItem.instructor}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
      </div>

      <div className="mt-5 border-t border-ink-100 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-ink-500">
            <Users className="h-3.5 w-3.5" />
            Enrollment
          </span>
          <span className={`font-semibold ${isFull ? 'text-rose-600' : 'text-ink-700'}`}>
            {classItem.student_count}/{classItem.capacity}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700"
            style={{ width: `${Math.min(fillPct, 100)}%` }}
          />
        </div>
      </div>
    </button>
  );
}
