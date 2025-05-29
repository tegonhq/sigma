import { endOfToday, startOfToday } from 'date-fns';

import type { TaskOccurrenceType } from 'common/types';

import type { TaskOccurrencesStoreType } from 'store/task-occurrences';

export const getTasksForToday = (
  taskOccurrencesStore: TaskOccurrencesStoreType,
) => {
  const fullTaskIds = taskOccurrencesStore.getKeys;

  const startOfDayTime = startOfToday();
  const endOfDayTime = endOfToday();
  const taskIds: string[] = [];

  // Iterate through the mobx map entries
  Array.from(fullTaskIds).forEach((taskId) => {
    const occurrences = taskOccurrencesStore.getTaskOccurrencesForTask(taskId);

    // Check if any occurrence for this task is within today
    const hasOccurrenceToday = occurrences.some(
      (occurrence: TaskOccurrenceType) => {
        const startTime = new Date(occurrence.startTime);
        const endTime = new Date(occurrence.endTime);

        return (
          (startTime >= startOfDayTime && startTime <= endOfDayTime) ||
          (endTime >= startOfDayTime && endTime <= endOfDayTime) ||
          (startTime <= startOfDayTime && endTime >= endOfDayTime)
        );
      },
    );

    if (hasOccurrenceToday) {
      taskIds.push(taskId);
    }
  });

  return taskIds;
};
