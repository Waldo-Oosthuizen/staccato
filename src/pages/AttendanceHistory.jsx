import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../config/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  User,
} from 'lucide-react';

const AttendanceHistory = () => {
  const { studentId } = useParams(); // comes from the URL
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentRef = doc(db, 'students', studentId);
        const snap = await getDoc(studentRef);

        if (!snap.exists()) {
          setError('Student not found.');
          setLoading(false);
          return;
        }

        const data = snap.data();
        setStudent({
          id: snap.id,
          ...data,
          attendanceHistory: data.attendanceHistory || [],
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching student:', err);
        setError('Failed to load attendance history.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const formatDate = (timestamp) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString();
    }
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Link
          to="/studentManagement"
          className="inline-flex items-center gap-2 text-sm text-blue-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to students
        </Link>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-gray-500" />
          <div>
            <h1 className="text-2xl font-bold">{student?.name || 'Student'}</h1>
            <p className="text-sm text-gray-500">Attendance History</p>
          </div>
        </div>

        <Link
          to="/studentManagement"
          className="inline-flex items-center gap-1 text-sm px-3 py-2 border rounded-md hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {student.attendanceHistory.length === 0 ? (
        <p className="text-gray-500">No attendance records yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {[...student.attendanceHistory]
            .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
            .map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center gap-1 ${
                    record.status === 'Present'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {record.status === 'Present' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {record.status}
                </span>

                <div className="flex items-center gap-4 text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(record.timestamp)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(record.timestamp)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
