import { ChevronRight, Mail } from 'lucide-react';
import type { StudentWithClass } from '../lib/supabase';
import { statusStyles } from '../utils/academic';
import { useRouter } from '../hooks/useRouter';

type StudentCardProps = {
  student: StudentWithClass;
};

export default function StudentCard({ student }: StudentCardProps) {
  const { navigate } = useRouter();

  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <button
      onClick={() => navigate({ name: 'student', id: student.id })}
      className="card card-hover group w-full p-4 text-left animate-fade-in-up"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-ink-900">{student.name}</h3>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
          </div>
          <p className="flex items-center gap-1.5 truncate text-xs text-ink-500">
            <Mail className="h-3 w-3" />
            {student.email}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="truncate text-xs text-ink-500">
          {student.class?.code ?? 'No class'}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusStyles(
            student.status,
          )}`}
        >
          {student.status}
        </span>
      </div>
    </button>
  );
}
