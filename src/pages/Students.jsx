import { useState, useEffect } from 'react';
import StudentCard from '../components/StudentCard';
import { Plus, GraduationCap } from 'lucide-react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { db } from '../config/firebase-config';
import FilterBar from '../components/FilterBar';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const Students = () => {
  const [students, setStudents] = useState([]);
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [operationError, setOperationError] = useState('');

  /* ---------- AUTH ---------- */
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setAuthReady(true);
      } else {
        setUid(null);
        setAuthReady(false);
      }
    });
    return unsub;
  }, []);

  /* ---------- FIRESTORE ---------- */
  useEffect(() => {
    if (!authReady || !uid) return;

    const q = query(collection(db, 'students'), where('ownerId', '==', uid));

    const unsub = onSnapshot(q, (snap) => {
      setStudents(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            localId: d.id, // ✅ STABLE FRONTEND ID
            id: d.id, // Firestore ID
            name: data.name || '',
            instrument: data.instrument || '',
            day: data.day || '',
            visitTime: data.visitTime || '',
            duration: Number(data.duration) || 60,
            isEditable: false,
            ownerId: data.ownerId || null,
          };
        })
      );
    });

    return unsub;
  }, [uid, authReady]);

  /* ---------- ADD ---------- */
  const handleAddRow = () => {
    if (!authReady) return;
    if (getAuth().currentUser?.email === 'guest@example.com') {
      setOperationError('The demo account is read-only.');
      return;
    }

    setStudents((prev) => [
      {
        localId: crypto.randomUUID(), // ✅ REQUIRED
        id: null,
        name: '',
        instrument: '',
        day: '',
        visitTime: '',
        duration: 30,
        isEditable: true,
      },
      ...prev,
    ]);
  };

  /* ---------- INPUT ---------- */
  const handleInputChange = (e, localId, field) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.localId === localId ? { ...s, [field]: e.target.value } : s
      )
    );
  };

  /* ---------- EDIT / SAVE ---------- */
  const toggleEditMode = async (localId) => {
    const student = students.find((s) => s.localId === localId);
    if (!student) return;
    if (getAuth().currentUser?.email === 'guest@example.com') {
      setOperationError('The demo account is read-only.');
      return;
    }

    const next = students.map((s) =>
      s.localId === localId ? { ...s, isEditable: !s.isEditable } : s
    );

    if (student.isEditable) {
      const uidSafe = uid || getAuth().currentUser?.uid;

      const payload = {
        name: student.name.trim(),
        instrument: student.instrument.trim(),
        day: student.day.trim(),
        visitTime: student.visitTime.trim(),
        duration: Number(student.duration) || 0,
        ownerId: uidSafe,
      };

      if (!payload.name || !payload.instrument || !payload.day) {
        alert('Please fill in all fields.');
        return;
      }

      try {
        setOperationError('');
        if (student.id) {
          await updateDoc(doc(db, 'students', student.id), payload);
        } else {
          const ref = await addDoc(collection(db, 'students'), payload);
          next.find((s) => s.localId === localId).id = ref.id;
        }
      } catch (error) {
        console.error('Failed to save student:', error);
        setOperationError('Could not save the student. Please try again.');
        return;
      }
    }

    setStudents(next);
  };

  /* ---------- DELETE ---------- */
  const handleRemoveRow = async (localId) => {
    const st = students.find((s) => s.localId === localId);
    if (getAuth().currentUser?.email === 'guest@example.com') {
      setOperationError('The demo account is read-only.');
      return;
    }

    try {
      setOperationError('');
      if (st?.id) {
        await deleteDoc(doc(db, 'students', st.id));
      }
      setStudents((prev) => prev.filter((s) => s.localId !== localId));
    } catch (error) {
      console.error('Failed to delete student:', error);
      setOperationError('Could not remove the student. Please try again.');
    }
  };

  /* ---------- GROUP + SORT ---------- */
  const unscheduledStudents = students.filter((s) => s.isEditable);

  const studentsByDay = DAYS.reduce((acc, day) => {
    const dayStudents = students.filter((s) => s.day === day);

    const editing = dayStudents.filter((s) => s.isEditable);
    const normal = dayStudents.filter((s) => !s.isEditable);

    acc[day] = [
      ...editing, // stay where user put them
      ...normal.sort((a, b) => a.visitTime.localeCompare(b.visitTime)),
    ];

    return acc;
  }, {});

  /* ---------- FILTER ---------- */
  const [searchTerm, setSearchTerm] = useState('');

  /* ---------- FILTER BY DAY ---------- */
  // get todays date and filter
  const getToday = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
    });

    return DAYS.includes(today) ? today : 'all';
  };
  const [dayFilter, setDayFilter] = useState(getToday());
  /* ---------- RENDER ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden bg-cover bg-center">
      <div
        className="flex flex-col gap-4
  bg-white p-8 lg:ml-16  mb-4 bg-white/70 backdrop-blur-xl border-b border-gray-200">
        <div className="flex justify-between w-full">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="text-2xl font-bold" /> Students
          </h2>
          <button
            onClick={handleAddRow}
            className="px-4 py-2 mt-4 bg-gradient-to-r from-[#00C853] to-[#009624] shadow-md hover:bg-emerald-800 text-white rounded-md mr-2">
            <Plus className="inline mr-2" />
            Add
          </button>
        </div>
        <div className="w-full  flex flex-col gap-4  md:flex-row ">
          {' '}
          <div className="relative  w-full ">
            {/* Use the new component and pass all 4 props */}
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dayFilter={dayFilter}
              setDayFilter={setDayFilter}
            />
          </div>
        </div>
      </div>
       <div className="lg:ml-16 px-4 pb-24 ">
        {operationError && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-red-700">
            {operationError}
          </p>
        )}
        {unscheduledStudents.length > 0 && (
          <div className="mb-10 ">
            <h3 className="text-lg font-bold mt-2 mb-3 border-b pb-1 ">
              Add Students
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unscheduledStudents.map((student) => (
                <StudentCard
                  key={student.localId}
                  student={student}
                  handleInputChange={handleInputChange}
                  toggleEditMode={toggleEditMode}
                  handleRemoveRow={handleRemoveRow}
                />
              ))}
            </div>
          </div>
        )}
        {DAYS
          // Filter the DAYS array itself based on the dropdown selection
          .filter((day) =>
            dayFilter === '' || dayFilter === 'all' ? true : day === dayFilter
          )
          .map((day) => (
            <div key={day} className="mb-10">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">📅 {day}</h2>

              {studentsByDay[day].length === 0 ? (
                <p className="text-gray-400">No students scheduled</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentsByDay[day]
                    .filter((student) => {
                      const query = searchTerm.toLowerCase();
                      return (
                        student.name.toLowerCase().includes(query) ||
                        student.instrument.toLowerCase().includes(query)
                      );
                    })
                    .map((student) => (
                      <StudentCard
                        key={student.localId}
                        student={student}
                        handleInputChange={handleInputChange}
                        toggleEditMode={toggleEditMode}
                        handleRemoveRow={handleRemoveRow}
                      />
                    ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Students;
