import assert from 'node:assert/strict';
import test from 'node:test';
import { getLocalDate } from './attendance.js';
import { createHomeworkHistoryEntry } from './homework.js';

test('getLocalDate returns a local calendar date', () => {
  assert.equal(getLocalDate(new Date(2026, 7, 3, 12)), '2026-08-03');
});

test('homework history entry retains the assignment timestamp', () => {
  const assignedAt = { seconds: 1_754_208_000, nanoseconds: 0 };

  assert.deepEqual(
    createHomeworkHistoryEntry({
      assignedDate: '2026-08-03',
      title: 'Practice scales',
      assignedAt,
    }),
    {
      date: '2026-08-03',
      title: 'Practice scales',
      assignedAt,
    }
  );
});
