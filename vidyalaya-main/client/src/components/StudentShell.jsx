import DashboardNav from '../pages/DashboardNav';
import { useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';

// Any route that starts with one of these prefixes will render inside the
// student dashboard shell (with top nav + sidebar).
const STUDENT_ROUTE_PREFIXES = [
  '/dashboard',
  '/my-courses',
  '/profile',
  '/explore-courses',
  '/ai-tutor',
  '/student/', // e.g. /student/assignments, /student/course/:courseId/learn
];

const isStudentRoute = (pathname) =>
  STUDENT_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const StudentShell = ({ children }) => {
  const location = useLocation();

  // If not on a student route, just render children without shell
  if (!isStudentRoute(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <DashboardNav activePage={location.pathname} />
      <div className="flex flex-1 overflow-hidden">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentShell;