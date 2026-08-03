import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase-config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { Notebook, ArrowLeft, Trash2 } from 'lucide-react';

const HomeWork = () => {
  const { studentId } = useParams();
  const auth = getAuth();

  const { state } = useLocation();
  const student = state?.student;
  const [homeworkList, setHomeworkList] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch homework for this student
  const fetchHomework = useCallback(async () => {
    if (!auth.currentUser) {
      console.log('No authenticated user');
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'homework'),
        where('studentId', '==', studentId),
        where('ownerId', '==', auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sortedData = data.sort((a, b) => b.assignedAt - a.assignedAt);

      setHomeworkList(sortedData);
      setError('');
    } catch (err) {
      console.error('Error fetching homework:', err);
      setError('Failed to load homework');
    } finally {
      setLoading(false);
    }
  }, [auth.currentUser, studentId]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  // Assign homework function
  const assignHomework = async () => {
    if (!title || !assignedDate) {
      setError('Title and due date are required');
      return;
    }

    if (!auth.currentUser) {
      setError('You must be logged in');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const assignedAt = Timestamp.now();

      await addDoc(collection(db, 'homework'), {
        studentId,
        title,
        description,
        assignedDate,
        status: 'not_done',
        ownerId: auth.currentUser.uid,
        assignedAt,
      });

      // clear the form
      setTitle('');
      setDescription('');
      setAssignedDate('');

      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        // 'date' here must match the key your getWeeklyStatus logic looks for
        homeworkHistory: arrayUnion({
          date: assignedDate, // This is the YYYY-MM-DD string
          title: title,
          assignedAt,
        }),
      });

      // Refresh list
      await fetchHomework();
    } catch (err) {
      console.error('Error assigning homework:', err);
      setError('Failed to assign homework');
    } finally {
      setLoading(false);
    }
  };

  //  toggle if home work has been done - function
  const updateHomeworkStatus = async (homeworkId, status) => {
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'homework', homeworkId), {
        status: status,
      });

      setHomeworkList((prev) =>
        prev.map((hw) => (hw.id === homeworkId ? { ...hw, status } : hw))
      );
    } catch (err) {
      console.error('Error updating homework', err);
      setError('Failed to update homework status');
    }
  };

  // Delete
  const deleteHomework = async (hw) => {
    if (
      !window.confirm(
        `Delete "${hw.title}"? This will also update the progress badge.`
      )
    ) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Delete from the main homework collection
      await deleteDoc(doc(db, 'homework', hw.id));

      // 2. Remove the specific entry from the Student's history array
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        homeworkHistory: arrayRemove({
          date: hw.assignedDate,
          title: hw.title,
          assignedAt: hw.assignedAt,
        }),
      });

      // 3. Update local UI state
      setHomeworkList((prev) => prev.filter((item) => item.id !== hw.id));
    } catch (err) {
      console.error('Error deleting homework:', err);
      setError('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 px-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Notebook className="h-6 w-6 text-gray-500" />
          <div>
            <h1 className="text-2xl font-bold">
              {student?.name
                ? `${student?.name}'s Homework`
                : 'Student Homework'}
            </h1>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          to="/studentManagemen"
          className="inline-flex items-center gap-1 text-sm px-3 py-2 border rounded-md hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        className="bg-white border rounded-lg p-4 mb-6"
        onSubmit={(e) => {
          e.preventDefault();
          assignHomework();
        }}>
        {/* Homework form */}
        <h2 className="font-semibold mb-3">Assign Homework</h2>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Homework title"
            className="w-full border rounded-md px-3 py-2"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border rounded-md px-3 py-2"
            rows={3}
          />
          <input
            type="date"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-md transition-colors">
            {loading ? 'Assigning...' : 'Assign Homework'}
          </button>
        </div>
      </form>

      {/* Homework List */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg mb-3">Assigned Homework</h2>
        {loading && homeworkList.length === 0 ? (
          <p className="text-gray-500">Loading...</p>
        ) : homeworkList.length === 0 ? (
          <p className="text-gray-500">No homework records yet.</p>
        ) : (
          homeworkList.map((hw) => (
            <div
              key={hw.id}
              className="
    border rounded-lg p-4
    flex flex-col gap-4
    sm:flex-row sm:items-center sm:justify-between bg-white
  ">
              {/* Homework info */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{hw.title}</h3>

                {hw.description && (
                  <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  Assigned: {hw.assignedDate}
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <select
                  value={hw.status || 'not_done'}
                  onChange={(e) => updateHomeworkStatus(hw.id, e.target.value)}
                  className="text-sm border rounded-md px-2 py-1 w-full sm:w-auto">
                  <option value="not_done">Not practiced</option>
                  <option value="partial">Partially practiced</option>
                  <option value="completed">Practiced</option>
                </select>

                <span
                  className={`text-sm px-3 py-1 rounded-full text-center whitespace-nowrap ${
                    hw.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : hw.status === 'partial'
                        ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                  }`}>
                  {hw.status === 'completed'
                    ? 'Practiced'
                    : hw.status === 'partial'
                      ? 'Partially practiced'
                      : 'Did not practice'}
                </span>
                {/* NEW DELETE BUTTON */}
                <button
                  onClick={() => deleteHomework(hw)}
                  disabled={loading}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeWork;
