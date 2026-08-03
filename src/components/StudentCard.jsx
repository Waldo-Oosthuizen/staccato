import {
  Pencil,
  Save,
  Trash2,
  User,
  Music2,
  Calendar,
  Clock,
} from 'lucide-react';

import PropTypes from 'prop-types';

/* ---------- Helpers ---------- */
const formatTime12 = (hhmm) => {
  if (!hhmm) return '';
  const [hhStr, mmStr] = hhmm.split(':');
  const hh = Number(hhStr);
  const mm = Number(mmStr || 0);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return hhmm;
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
};

const StudentCard = ({
  student,
  handleInputChange,
  toggleEditMode,
  handleRemoveRow,
}) => {
  const visitTime = student.visitTime || '';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4  border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-black" />
          <h2 className="font-semibold text-black">
            {student.name || 'New Student'}
          </h2>
        </div>
        <span
          className={
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm bg-gradient-to-r from-[#00C853] to-[#009624] text-white shadow-md'
          }>
          {student.day || 'No Day Set'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {student.isEditable ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                value={student.name || ''}
                onChange={(e) => handleInputChange(e, student.localId, 'name')}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrument
              </label>
              <input
                value={student.instrument || ''}
                onChange={(e) =>
                  handleInputChange(e, student.localId, 'instrument')
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                value={student.day || ''}
                onChange={(e) => handleInputChange(e, student.localId, 'day')}
                className="w-full px-3 py-2 border rounded-md">
                <option value="">Select Day</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                value={student.duration ?? ''}
                onChange={(e) =>
                  handleInputChange(e, student.localId, 'duration')
                }
                className="w-full px-3 py-2 border rounded-md">
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Time
              </label>
              <input
                type="time"
                value={visitTime}
                onChange={(e) =>
                  handleInputChange(e, student.localId, 'visitTime')
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-gray-400" />
              <span>{student.instrument || 'No Instrument'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {student.day}
                {visitTime ? ` ${formatTime12(visitTime)}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{student.duration} min</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-2 border-t mt-4">
          <button
            onClick={() => toggleEditMode(student.localId)}
            className={`flex-1 px-3 py-2 rounded-md text-white ${
              student.isEditable
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}>
            {student.isEditable ? (
              <>
                <Save className="h-4 w-4 inline mr-1" />
                Save
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 inline mr-1" />
                Edit
              </>
            )}
          </button>

          <button
            onClick={() => handleRemoveRow(student.localId)}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-md">
            <Trash2 className="h-4 w-4 inline mr-1 " />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// Prop Validation
StudentCard.propTypes = {
  student: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  handleRemoveRow: PropTypes.func.isRequired,
};

export default StudentCard;
