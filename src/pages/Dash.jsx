import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';
import PropTypes from 'prop-types';

const DashboardCard = ({ title, description, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
    <div className="mb-5 flex items-start justify-between">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <ArrowRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
    </div>
    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
  </button>
);

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
};

const formatTime = (time) => {
  if (!time) return 'Time not set';
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${((hour + 11) % 12) + 1}:${String(minute).padStart(2, '0')} ${period}`;
};

const Home = () => {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [todayStudents, setTodayStudents] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
      }).format(new Date());
      const studentsQuery = query(
        collection(db, 'students'),
        where('ownerId', '==', user.uid)
      );
      const snapshot = await getDocs(studentsQuery);
      const students = snapshot.docs.map((studentDoc) => ({
        id: studentDoc.id,
        ...studentDoc.data(),
      }));

      setStudentCount(students.length);
      setTodayStudents(
        students
          .filter((student) => student.day === today)
          .sort((a, b) => (a.visitTime || '').localeCompare(b.visitTime || ''))
      );
    });

    return unsubscribe;
  }, []);

  const dashboardItems = [
    {
      title: 'Students',
      description: 'Add, edit, and organise student profiles.',
      onClick: () => navigate('/students'),
      icon: UserRound,
    },
    {
      title: 'Attendance',
      description: 'Mark lessons and review weekly progress.',
      onClick: () => navigate('/studentManagement'),
      icon: Users,
    },
    {
      title: 'Teaching calendar',
      description: 'See your complete weekly schedule.',
      onClick: () => navigate('/schedule'),
      icon: CalendarDays,
    },
    {
      title: 'Settings',
      description: 'Logout',
      onClick: () => navigate('/settings'),
      icon: Settings,
    },
  ];

  const todayLabel = new Intl.DateTimeFormat('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pl-20 md:pb-8">
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 px-6 py-8 text-white shadow-xl sm:px-8 sm:py-10">
          <p className="text-sm font-medium text-emerald-100">{todayLabel}</p>
          <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your teaching day, at a glance.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                Keep students, attendance, homework, and your schedule in one
                calm workspace.
              </p>
            </div>
            <button
              onClick={() => navigate('/studentManagement')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-700">
              Mark attendance <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Students
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {studentCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Lessons today
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {todayStudents.length}
            </p>
          </div>
          <div className="col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Next step
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-950">
              {todayStudents.length
                ? `You have ${todayStudents.length} lesson${todayStudents.length === 1 ? '' : 's'} to manage today.`
                : 'Your schedule is clear for today.'}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Workspace</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Manage your studio
              </h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardItems.map((item) => (
              <DashboardCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Today&apos;s schedule
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Upcoming lessons
              </h2>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              View calendar
            </button>
          </div>

          {todayStudents.length ? (
            <div className="divide-y divide-slate-100">
              {todayStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {student.name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {student.instrument || 'General lesson'} ·{' '}
                      {formatTime(student.visitTime)} · {student.duration || 60}{' '}
                      min
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/homework/${student.id}`, {
                        state: { student },
                      })
                    }
                    className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 sm:inline-flex">
                    <BookOpen className="h-4 w-4" /> Homework
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-800">
                No lessons scheduled
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a student or check your schedule for another day.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
