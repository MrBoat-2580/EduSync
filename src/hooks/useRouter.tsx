import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'classes' }
  | { name: 'class'; id: string }
  | { name: 'students' }
  | { name: 'student'; id: string }
  | { name: 'reports' };

type RouterValue = {
  route: Route;
  navigate: (route: Route) => void;
};

const RouterContext = createContext<RouterValue | undefined>(undefined);

// Minimal hash-based router — no react-router dependency needed.
export function RouterProvider({ children }: { children: ReactNode }) {
  const parse = useCallback((): Route => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const [seg, id] = hash.split('/');
    if (seg === 'classes') return { name: 'classes' };
    if (seg === 'class' && id) return { name: 'class', id };
    if (seg === 'students') return { name: 'students' };
    if (seg === 'student' && id) return { name: 'student', id };
    if (seg === 'reports') return { name: 'reports' };
    return { name: 'dashboard' };
  }, []);

  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const onHash = () => {
      setRoute(parse());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [parse]);

  const navigate = useCallback((next: Route) => {
    let hash = '#/';
    switch (next.name) {
      case 'classes':
        hash = '#/classes';
        break;
      case 'class':
        hash = `#/class/${next.id}`;
        break;
      case 'students':
        hash = '#/students';
        break;
      case 'student':
        hash = `#/student/${next.id}`;
        break;
      case 'reports':
        hash = '#/reports';
        break;
      case 'dashboard':
      default:
        hash = '#/';
    }
    window.location.hash = hash;
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider');
  return ctx;
}
