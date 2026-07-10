import { GraduationCap } from 'lucide-react';
import { useSchoolSettings } from '../context/SchoolSettings';

export default function Footer() {
  const { schoolName } = useSchoolSettings();
  return (
    <footer className="border-t border-ink-200/70 bg-white px-6 py-4 lg:px-8">
      <div className="flex items-center justify-center gap-2 text-sm text-ink-500">
        <GraduationCap className="h-4 w-4 text-brand-500" />
        <span>
          <span className="font-semibold text-ink-700">{schoolName}</span> · Admin Academic Dashboard
        </span>
      </div>
    </footer>
  );
}
