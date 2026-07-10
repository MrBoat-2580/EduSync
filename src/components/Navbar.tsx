import { GraduationCap, LayoutDashboard, BookOpen, Users, FileText, Settings } from 'lucide-react';
import { useRouter, type Route } from '../hooks/useRouter';
import { useSchoolSettings } from '../context/SchoolSettings';

const navItems: { label: string; route: Route; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', route: { name: 'dashboard' }, icon: LayoutDashboard },
  { label: 'Classes', route: { name: 'classes' }, icon: BookOpen },
  { label: 'Students', route: { name: 'students' }, icon: Users },
  { label: 'Reports', route: { name: 'reports' }, icon: FileText },
];

export default function Navbar() {
  const { route, navigate } = useRouter();
  const { schoolName, openSettings } = useSchoolSettings();

  const isActive = (r: Route) => {
    if (r.name === 'classes' && (route.name === 'class' || route.name === 'classes')) return true;
    if (r.name === 'students' && (route.name === 'student' || route.name === 'students')) return true;
    return r.name === route.name;
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200/70 bg-white px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="display text-lg font-bold text-ink-900">{schoolName}</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Manage
        </p>
        {navItems.map(({ label, route: r, icon: Icon }) => (
          <button
            key={label}
            onClick={() => navigate(r)}
            className={`nav-link ${isActive(r) ? 'nav-link-active' : ''}`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </nav>

      <div className="space-y-2">
        <button
          onClick={openSettings}
          className="flex w-full items-center justify-between rounded-xl border border-ink-200/70 bg-ink-50 px-3 py-3 text-left transition-colors hover:bg-ink-100"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">Admin</p>
              <p className="truncate text-xs text-ink-500">Administrator</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-ink-500" />
        </button>
      </div>
    </aside>
  );
}
