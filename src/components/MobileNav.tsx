import { GraduationCap, BookOpen, Users, FileText, LayoutDashboard, Settings } from 'lucide-react';
import { useRouter, type Route } from '../hooks/useRouter';
import { useSchoolSettings } from '../context/SchoolSettings';

const items: { label: string; route: Route; icon: typeof LayoutDashboard }[] = [
  { label: 'Home', route: { name: 'dashboard' }, icon: LayoutDashboard },
  { label: 'Classes', route: { name: 'classes' }, icon: BookOpen },
  { label: 'Students', route: { name: 'students' }, icon: Users },
  { label: 'Reports', route: { name: 'reports' }, icon: FileText },
];

export default function MobileNav() {
  const { route, navigate } = useRouter();
  const { schoolName, openSettings } = useSchoolSettings();
  const isActive = (r: Route) => {
    if (r.name === 'classes' && (route.name === 'class' || route.name === 'classes')) return true;
    if (r.name === 'students' && (route.name === 'student' || route.name === 'students')) return true;
    return r.name === route.name;
  };

  return (
    <div className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/90 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="display text-base font-bold text-ink-900">{schoolName}</span>
        </div>
        <nav className="flex gap-1">
          {items.map(({ label, route: r, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(r)}
              className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
                isActive(r) ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100'
              }`}
              aria-label={label}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          ))}
          <button
            onClick={openSettings}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100"
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </div>
  );
}
