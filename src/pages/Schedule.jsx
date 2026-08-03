import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addWeeks,
  addDays,
  addMinutes,
  set,
} from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enZA from 'date-fns/locale/en-ZA';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../config/firebase-config';

const locales = {
  'en-ZA': enZA,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Day name to index (relative to Monday start)
const dayNameToIndex = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

// Function to build recurring events
function buildWeeklyEventsFromStudents(students, weeksAhead = 12) {
  const events = [];

  // start from this week's Monday
  const firstWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  for (let w = 0; w < weeksAhead; w++) {
    const weekStart = addWeeks(firstWeekStart, w);

    students.forEach((st) => {
      if (!st.day || !st.visitTime) return;

      const dayOffset = dayNameToIndex[st.day];
      if (dayOffset == null) return;

      const [hour, minute] = (st.visitTime || '').split(':').map(Number);

      const lessonDate = addDays(weekStart, dayOffset);

      // build start date
      const start = set(lessonDate, {
        hours: hour || 0,
        minutes: minute || 0,
        seconds: 0,
        milliseconds: 0,
      });

      // build end Date
      const durationMinutes = Number(st.duration) || 60;
      const end = addMinutes(start, durationMinutes);

      events.push({
        title: st.instrument
          ? `${st.name || 'Lesson'} – ${st.instrument}`
          : st.name || 'Lesson',
        start,
        end,
      });
    });
  }

  return events;
}

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const defaultView = Views.DAY;

  /* ----------  AUTH HANDSHAKE  ---------- */
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Auth confirmed in Schedule:', user.uid);
        setUid(user.uid);
        setAuthReady(true);
      } else {
        console.warn('⚠️ No user in Schedule');
        setUid(null);
        setAuthReady(false);
      }
    });

    return unsub;
  }, []);

  /* ----------  FIRESTORE -> EVENTS  ---------- */
  useEffect(() => {
    if (!authReady || !uid) {
      console.log('⏳ Waiting for auth in Schedule...');
      return;
    }

    const studentsCol = collection(db, 'students');
    const q = query(studentsCol, where('ownerId', '==', uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        console.log('📦 Schedule snapshot:', snap.docs.length, 'students');

        // 1. Map Firestore docs → student objects
        const students = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || 'Unnamed student',
            instrument: data.instrument || '',
            day: data.day || '',
            visitTime: data.visitTime || '',
            duration: Number(data.duration) || 60,
          };
        });

        // 2. Build recurring weekly events
        const weeklyEvents = buildWeeklyEventsFromStudents(students, 12); // 12 weeks ahead

        // 3. Save to state
        setEvents(weeklyEvents);
      },
      (err) => console.error('🔥 Firestore Schedule error:', err)
    );

    return unsub;
  }, [authReady, uid]);

  /* ----------  Custom colors for events  ---------- */
  const eventStyleGetter = () => {
    return {
      style: {
        background: 'linear-gradient(to right, #00c853, #009624)',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '0.85rem',
        fontWeight: '500',
      },
    };
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-cover bg-center">
      <div className="shadow-lg rounded-lg p-4 sm:p-8 max-w-full mx-auto lg:ml-16 ml-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {!authReady && (
          <p className="mb-4 text-sm text-black-500">
            Checking your account...
          </p>
        )}
        {authReady && events.length === 0 && (
          <p className="mb-4 text-sm text-black-500">
            No scheduled lessons yet. Add students with times on the Students
            page to see them here.
          </p>
        )}

        {/* FIX: Removed overflow-y-auto and overflow-x-auto. Fixed calc() syntax. */}
        <div className="mt-2 h-[calc(100vh-180px)] sm:h-[calc(100vh-100px)] mb-4 rounded-md">
          <Calendar
            localizer={localizer}
            events={
              Array.isArray(events)
                ? events.filter((e) => e?.title && e?.start && e?.end)
                : []
            }
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            views={{ day: true }}
            defaultView={defaultView}
            /* FIX: Let the Calendar take 100% of the parent wrapper's height */
            style={{ height: '100%', width: '100%' }}
            showMultiDayTimes={true}
            min={new Date(1970, 0, 1, 9, 0)} // 08:00
            max={new Date(1970, 0, 1, 20, 0)} // 20:00
          />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
