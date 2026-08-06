import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {
  addDays,
  addMinutes,
  addWeeks,
  format,
  getDay,
  parse,
  set,
  startOfWeek,
} from 'date-fns';
import enZA from 'date-fns/locale/en-ZA';
import { CalendarDays, Clock3, Users } from 'lucide-react';
import PropTypes from 'prop-types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../config/firebase-config';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-ZA': enZA },
});

const dayNameToIndex = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

const buildWeeklyEventsFromStudents = (students, weeksAhead = 12) => {
  const events = [];
  const firstWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  for (let week = 0; week < weeksAhead; week += 1) {
    const weekStart = addWeeks(firstWeekStart, week);
    students.forEach((student) => {
      if (!student.day || !student.visitTime) return;
      const dayOffset = dayNameToIndex[student.day];
      if (dayOffset == null) return;

      const [hour, minute] = student.visitTime.split(':').map(Number);
      const start = set(addDays(weekStart, dayOffset), {
        hours: hour || 0,
        minutes: minute || 0,
        seconds: 0,
        milliseconds: 0,
      });
      const end = addMinutes(start, Number(student.duration) || 60);

      events.push({
        title: student.name || 'Lesson',
        instrument: student.instrument || 'General lesson',
        start,
        end,
      });
    });
  }

  return events;
};

const CalendarEvent = ({ event }) => (
  <div className="calendar-event">
    <p>{event.title}</p>
  </div>
);

CalendarEvent.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    instrument: PropTypes.string.isRequired,
  }).isRequired,
};

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [view, setView] = useState(Views.WEEK);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setUid(user?.uid || null);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authReady || !uid) return undefined;

    const studentsQuery = query(
      collection(db, 'students'),
      where('ownerId', '==', uid)
    );
    const unsubscribe = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const students = snapshot.docs.map((studentDoc) => {
          const data = studentDoc.data();
          return {
            id: studentDoc.id,
            name: data.name || 'Unnamed student',
            instrument: data.instrument || '',
            day: data.day || '',
            visitTime: data.visitTime || '',
            duration: Number(data.duration) || 60,
          };
        });
        setEvents(buildWeeklyEventsFromStudents(students));
        setScheduleError('');
      },
      () =>
        setScheduleError(
          'Your schedule could not be loaded. Please refresh and try again.'
        )
    );

    return unsubscribe;
  }, [authReady, uid]);

  const todaysLessons = events.filter(
    (event) =>
      format(event.start, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pl-20 md:pb-8">
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 px-6 py-7 text-white shadow-xl sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-emerald-100">
                Teaching calendar
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Plan your week with confidence.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
                Lessons update automatically when you edit a student&apos;s day,
                time, or duration.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-emerald-100">
                  Lessons today
                </p>
                <p className="mt-1 text-2xl font-bold">{todaysLessons}</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-emerald-100">
                  Scheduled
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {events.length / 12 || 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        {!authReady && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
            <Clock3 className="h-5 w-5 animate-pulse text-emerald-600" />{' '}
            Checking your account…
          </div>
        )}

        {scheduleError && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {scheduleError}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Lesson timetable
                </h2>
                <p className="text-sm text-slate-500">
                  Use the controls to move through your schedule.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" /> {events.length / 12 || 0} recurring
              lessons
            </div>
            <p className="text-xs text-slate-500 sm:hidden">
              Swipe sideways to see the full week.
            </p>
          </div>

          {authReady && !events.length ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays className="mx-auto h-11 w-11 text-slate-300" />
              <h3 className="mt-4 font-semibold text-slate-800">
                No lessons scheduled yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Add lesson days and times to student profiles and they will
                appear here automatically.
              </p>
            </div>
          ) : (
            <div className="schedule-calendar h-[68vh] min-h-[540px] p-3 sm:p-5">
              <div className="h-full min-w-[760px] sm:min-w-0">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  components={{ event: CalendarEvent }}
                  view={view}
                  onView={setView}
                  views={{ day: true, week: true }}
                  min={new Date(1970, 0, 1, 8, 0)}
                  max={new Date(1970, 0, 1, 20, 0)}
                  step={30}
                  timeslots={2}
                  // Revert this back to just your original dayFormat
                  formats={{ dayFormat: (date) => format(date, 'EEE dd') }}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Schedule;
