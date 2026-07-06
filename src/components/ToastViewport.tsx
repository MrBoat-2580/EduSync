import { Check, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function ToastViewport() {
  const { toasts } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in-up ${
            t.type === 'error' ? 'bg-rose-600' : 'bg-ink-900'
          }`}
        >
          {t.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
