import { BookMarked, GraduationCap, PencilLine } from 'lucide-react';

type SubjectCardProps = {
  subject: {
    id: string;
    name: string;
    instructor: string;
    className: string;
  };
  onEdit: () => void;
};

export default function SubjectCard({ subject, onEdit }: SubjectCardProps) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            {subject.className}
          </p>
          <h3 className="display mt-1 text-lg font-semibold text-ink-900">{subject.name}</h3>
          <p className="mt-1 text-sm text-ink-500">{subject.instructor}</p>
        </div>
        <button
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
          aria-label="Edit subject"
        >
          <PencilLine className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-ink-100 pt-4 text-sm text-ink-500">
        <span className="flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4" />
          Instructor-led
        </span>
        <span className="flex items-center gap-1.5">
          <BookMarked className="h-4 w-4" />
          Core subject
        </span>
      </div>
    </div>
  );
}
