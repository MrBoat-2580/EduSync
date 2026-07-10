import { useEffect, useState } from 'react';
import { Palette, Building2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { useSchoolSettings, type ThemeOption } from '../context/SchoolSettings';

const themeOptions: { value: ThemeOption; label: string; accent: string }[] = [
  { value: 'indigo', label: 'Indigo', accent: 'bg-indigo-600' },
  { value: 'emerald', label: 'Emerald', accent: 'bg-emerald-600' },
  { value: 'violet', label: 'Violet', accent: 'bg-violet-600' },
  { value: 'amber', label: 'Amber', accent: 'bg-amber-600' },
];

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings, theme, schoolName, setTheme, setSchoolName } = useSchoolSettings();
  const [draftName, setDraftName] = useState(schoolName);

  useEffect(() => {
    setDraftName(schoolName);
  }, [schoolName, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  return (
    <Modal
      open={isSettingsOpen}
      onClose={closeSettings}
      title="Admin Settings"
      description="Adjust the school identity and dashboard theme."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={closeSettings}>
            Close
          </Button>
          <Button
            onClick={() => {
              setSchoolName(draftName.trim() || 'TRINITY EDUCATIONAL COMPLEX');
              closeSettings();
            }}
          >
            Save Settings
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-ink-200/70 bg-ink-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Building2 className="h-4 w-4" />
            School identity
          </div>
          <label className="mt-4 block text-sm font-medium text-ink-700">
            School name
          </label>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Enter school name"
            className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="rounded-2xl border border-ink-200/70 bg-ink-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Palette className="h-4 w-4" />
            Theme
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition ${
                  theme === option.value
                    ? 'border-brand-400 bg-white shadow-sm'
                    : 'border-ink-200 bg-white/70 hover:bg-white'
                }`}
              >
                <span className="font-medium text-ink-700">{option.label}</span>
                <span className={`h-3.5 w-3.5 rounded-full ${option.accent}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
