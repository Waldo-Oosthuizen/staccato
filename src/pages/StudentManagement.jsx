import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../config/firebase-config';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  User,
} from 'lucide-react';
import FilterBar from '../components/FilterBar';
import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { getLocalDate } from '../utils/attendance';

// For filter
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getToday = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  return DAYS.includes(today) ? today : 'all';
};

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const dayFilter = searchParams.get('day') || getToday();

  const handleDayChange = (newDay) => {
    setSearchParams({ day: newDay });
  };

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn('⚠️ No user logged in');
        setError('You must be logged in to view attendance.');
        setLoading(false);
        return;
      }

      try {
        console.log('✅ Auth confirmed in Attendance:', user.uid);
        // Fetching students
        const q = query(
          collection(db, 'students'),
          where('ownerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);

        const studentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          attendanceHistory: doc.data().attendanceHistory || [],
        }));

        setStudents(studentList);
        setError(null);
        console.log(
          `📦 Loaded ${studentList.length} students for UID ${user.uid}`
        );
      } catch (error) {
        console.error('🔥 Error fetching students:', error);
        setError('Failed to fetch students. Please try again later.');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleAttendance = async (studentId, status) => {
    if (getAuth().currentUser?.email === 'guest@example.com') {
      setError('The demo account is read-only.');
      return;
    }
    setUpdating(studentId);
    try {
      const studentRef = doc(db, 'students', studentId);
      const attendanceRecord = {
        status,
        timestamp: Timestamp.now(),
        date: getLocalDate(),
      };

      await updateDoc(studentRef, {
        attendance: status,
        attendanceHistory: arrayUnion(attendanceRecord),
      });

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId
            ? {
                ...student,
                attendance: status,
                attendanceHistory: [
                  ...(student.attendanceHistory || []),
                  attendanceRecord,
                ],
              }
            : student
        )
      );
      console.log(`✅ Marked ${studentId} as ${status}`);
    } catch (error) {
      console.error('🔥 Error updating attendance:', error);
      setError('Failed to update attendance. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getAttendanceStats = (history) => {
    if (!history || history.length === 0) return { present: 0, absent: 0 };
    return history.reduce(
      (acc, record) => ({
        present: acc.present + (record.status === 'Present' ? 1 : 0),
        absent: acc.absent + (record.status === 'Absent' ? 1 : 0),
      }),
      { present: 0, absent: 0 }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Filter function for UI display
  const studentsByDay = DAYS.reduce((acc, day) => {
    acc[day] = students
      .filter((student) => student.day === day)
      .sort((a, b) => a.visitTime.localeCompare(b.visitTime));

    return acc;
  }, {});

  // check if homework was marked for the week:
  const getWeeklyStatus = (student) => {
    // 1. Define the current week boundaries (Monday start)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // 2. Check Attendance History for any record within this week
    const attendanceThisWeek = student.attendanceHistory?.some((record) => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, { start: weekStart, end: weekEnd });
    });

    // 3. Check Homework History
    const homeworkThisWeek = student.homeworkHistory?.some((hw) => {
      const hwDate = parseISO(hw.date);
      return isWithinInterval(hwDate, { start: weekStart, end: weekEnd });
    });

    return {
      attendanceDone: attendanceThisWeek,
      homeworkDone: homeworkThisWeek,
      fullyComplete: attendanceThisWeek && homeworkThisWeek,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden bg-cover bg-center">
      <header
        className="  flex flex-col gap-4
  bg-white p-8 lg:ml-16 mb-4 bg-white/70 backdrop-blur-xl border-b border-gray-200 ">
        <div className="flex items-center gap-2 w-full">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Student Attendance & Homework</h1>
        </div>
        {/*Filter bar */}
        <div className="mt-4 md:mt-0">
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dayFilter={dayFilter}
            setDayFilter={handleDayChange}
          />
        </div>
      </header>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200  flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}
      {
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:ml-16 px-4 pb-24">
          {DAYS.filter((day) =>
            dayFilter === 'all' || dayFilter === '' ? true : day === dayFilter
          ).map((day) => (
            <div key={day} className="col-span-full">
              {/* Day Header */}
              <h2 className="text-xl font-bold  mb-4 border-b pb-2">
                📅 {day}
              </h2>

              {studentsByDay[day].length === 0 ? (
                <p className="text-gray-400 mb-6">
                  No students scheduled for this day
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentsByDay[day]
                    .filter((student) => {
                      const query = searchTerm.toLowerCase();
                      return (
                        student.name.toLowerCase().includes(query) ||
                        student.day.toLowerCase().includes(query)
                      );
                    })
                    .map((student) => {
                      const stats = getAttendanceStats(
                        student.attendanceHistory
                      );

                      const today = new Date().toISOString().split('T')[0];
                      const attendanceDoneToday =
                        student.attendanceHistory?.some(
                          (record) => record.date === today
                        );
                      const isAttendanceDisabled = attendanceDoneToday;

                      const weekly = getWeeklyStatus(student);
                      return (
                        <div
                          key={student.id}
                          className="bg-white rounded-lg shadow-lg overflow-hidden">
                          {/* Card Header */}
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-black" />
                                <h2 className="font-semibold text-black">
                                  {student.name}
                                </h2>
                                {/* Weekly Progress Badge */}
                                <div className="flex gap-1">
                                  <div
                                    className={`h-2 w-8 rounded-full ${weekly.attendanceDone ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                    title="Attendance"
                                  />
                                  <div
                                    className={`h-2 w-8 rounded-full ${weekly.homeworkDone ? 'bg-amber-500' : 'bg-gray-200'}`}
                                    title="Homework"
                                  />
                                </div>
                              </div>

                              {/* Detailed Status Label */}
                              <p className="text-xs text-gray-500">
                                {weekly.fullyComplete
                                  ? '✅ Ready for next week'
                                  : `Pending: ${!weekly.attendanceDone ? 'Attendance' : ''} ${!weekly.homeworkDone ? 'Homework' : ''}`}
                              </p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="p-4 bg-white">
                            <div className="flex justify-around mb-4">
                              <div className="text-center">
                                <div className="text-green-600 font-semibold">
                                  {stats.present}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Present
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-red-600 font-semibold">
                                  {stats.absent}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Absent
                                </div>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleAttendance(student.id, 'Present')
                                }
                                disabled={
                                  updating === student.id ||
                                  isAttendanceDisabled
                                }
                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md">
                                <CheckCircle className="h-4 w-4" />
                                {isAttendanceDisabled ? 'Marked' : 'Present'}
                              </button>

                              <button
                                onClick={() =>
                                  handleAttendance(student.id, 'Absent')
                                }
                                disabled={
                                  updating === student.id ||
                                  isAttendanceDisabled
                                }
                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md">
                                <XCircle className="h-4 w-4" />
                                Absent
                              </button>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() =>
                                  navigate(`/attendance/${student.id}`, {
                                    state: { student },
                                  })
                                }
                                className="flex-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                Attendance
                              </button>

                              <button
                                onClick={() =>
                                  navigate(`/homework/${student.id}`, {
                                    state: { student },
                                  })
                                }
                                className="flex-1 px-3 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-md">
                                📚 Homework
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default StudentManagement;
