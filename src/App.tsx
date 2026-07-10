import { RouterProvider, useRouter } from './hooks/useRouter';
import { ToastProvider } from './hooks/useToast';
import { SchoolSettingsProvider } from './context/SchoolSettings';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import ToastViewport from './components/ToastViewport';
import SettingsModal from './components/SettingsModal';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Reports from './pages/Reports';

function CurrentPage() {
  const { route } = useRouter();
  switch (route.name) {
    case 'classes':
      return <Classes />;
    case 'class':
      return <ClassDetails id={route.id} />;
    case 'students':
      return <Students />;
    case 'student':
      return <StudentDetails id={route.id} />;
    case 'reports':
      return <Reports />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
}

export default function App() {
  return (
    <SchoolSettingsProvider>
      <ToastProvider>
        <RouterProvider>
          <div className="flex min-h-screen bg-ink-50">
            <Navbar />
            <div className="flex min-w-0 flex-1 flex-col">
              <MobileNav />
              <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <CurrentPage />
              </main>
              <Footer />
            </div>
          </div>
          <ToastViewport />
          <SettingsModal />
        </RouterProvider>
      </ToastProvider>
    </SchoolSettingsProvider>
  );
}
