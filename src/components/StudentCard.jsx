import {
  CalendarDays,
  Clock3,
  Music2,
  Pencil,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import PropTypes from 'prop-types';

const formatTime12 = (time) => {
  if (!time) return 'Time not set';
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${((hour + 11) % 12) + 1}:${String(minute).padStart(2, '0')} ${period}`;
};

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';

const StudentCard = ({
  student,
  handleInputChange,
  toggleEditMode,
  handleRemoveRow,
}) => {
  const isNew = !student.id;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900">
              {student.name || 'New student'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isNew ? 'Complete the details to add them' : student.instrument || 'Instrument not set'}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          {student.day || 'Unscheduled'}
        </span>
      </header>

      <div className="p-5">
        {student.isEditable ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                value={student.name || ''}
                onChange={(event) => handleInputChange(event, student.localId, 'name')}
                className={inputClassName}
                placeholder="Student name"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Instrument
              <input
                value={student.instrument || ''}
                onChange={(event) => handleInputChange(event, student.localId, 'instrument')}
                className={inputClassName}
                placeholder="e.g. Piano"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Lesson day
              <select
                value={student.day || ''}
                onChange={(event) => handleInputChange(event, student.localId, 'day')}
                className={inputClassName}>
                <option value="">Select a day</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Start time
              <input
                type="time"
                value={student.visitTime || ''}
                onChange={(event) => handleInputChange(event, student.localId, 'visitTime')}
                className={inputClassName}
              />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Lesson duration
              <select
                value={student.duration ?? ''}
                onChange={(event) => handleInputChange(event, student.localId, 'duration')}
                className={inputClassName}>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </label>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Music2 className="h-3.5 w-3.5" /> Instrument
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">{student.instrument || 'Not set'}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock3 className="h-3.5 w-3.5" /> Time
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">{formatTime12(student.visitTime)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" /> Day
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">{student.day || 'Not set'}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs font-medium text-slate-500">Duration</dt>
              <dd className="mt-1 font-semibold text-slate-800">{student.duration || 60} min</dd>
            </div>
          </dl>
        )}

        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleEditMode(student.localId)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            {student.isEditable ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {student.isEditable ? 'Save student' : 'Edit'}
          </button>
          <button
            onClick={() => handleRemoveRow(student.localId)}
            className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-2.5 text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            aria-label={`Remove ${student.name || 'student'}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

StudentCard.propTypes = {
  student: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  handleRemoveRow: PropTypes.func.isRequired,
};

export default StudentCard;
