/* eslint-disable react-hooks/exhaustive-deps */
import { addDays, isToday, isTomorrow, isWithinInterval } from 'date-fns';
import { sort } from 'fast-sort';
import React from 'react';

import { filterTasksNoHook, type IssueRow } from 'modules/tasks/utils';

import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

import { useContextStore } from 'store/global-context-provider';

interface TaskTypeWithOccurrence extends TaskType {
  taskOccurrenceId: string;
}

export const useTaskRows = (collapsedHeader: Record<string, boolean>) => {
  const { pagesStore, taskOccurrencesStore, tasksStore } = useContextStore();
  const { filters, displaySettings } = useApplication();
  const taskOccurrences = taskOccurrencesStore.getTaskOccurrences;

  const tasks = tasksStore.getTasks({});

  // Memoize planCategories since it's static
  const planCategories = React.useMemo(
    () => ['Today', 'Tomorrow', 'Rest of the week', 'Later'] as const,
    [],
  );

  const getTasksForPlan = React.useCallback(
    (plan: (typeof planCategories)[number], existingTasks: TaskType[]) => {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const endOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 7),
      ); // Get end of current week (Sunday)

      if (plan === 'Later') {
        // For Later, return all tasks that don't have occurrences in other time periods
        const tasksWithOccurrences = taskOccurrences.map((occ) => occ.taskId);
        return tasks
          .filter((task) => !tasksWithOccurrences.includes(task.id))
          .map((task) => ({
            ...task,
            taskOccurrenceId: '', // Empty string since these tasks don't have occurrences
          }))
          .filter((task) => !existingTasks.find((t) => t.id === task.id));
      }

      return taskOccurrences
        .filter((occurrence) => {
          const startTime = new Date(occurrence.startTime);

          switch (plan) {
            case 'Today': {
              return isToday(startTime);
            }
            case 'Tomorrow':
              return isTomorrow(startTime);
            case 'Rest of the week':
              return isWithinInterval(startTime, {
                start: addDays(tomorrow, 1),
                end: endOfWeek,
              });
            default:
              return false;
          }
        })
        .map((occurrence) => ({
          ...tasksStore.getTaskWithId(occurrence.taskId),
          taskOccurrenceId: occurrence.id,
        }));
    },
    [taskOccurrences, tasksStore, tasks],
  );

  const rows = React.useMemo(() => {
    const rows: IssueRow[] = [];
    let existingTasks: TaskType[] = [];

    planCategories.forEach((plan) => {
      const tasks = getTasksForPlan(plan, existingTasks);

      const filteredTasks = filterTasksNoHook(tasks, filters, displaySettings);
      existingTasks = [...existingTasks, ...tasks];

      if (
        filteredTasks.length !== 0 ||
        (filteredTasks.length === 0 && displaySettings.showEmptyGroups)
      ) {
        rows.push({
          type: 'header',
          key: plan,
          count: filteredTasks.length,
        });
      }

      if (!collapsedHeader[plan]) {
        for (const task of sort(filteredTasks).by([
          { desc: (task) => task.status === 'Todo' },
        ])) {
          const taskOccurrenceId = (task as TaskTypeWithOccurrence)
            .taskOccurrenceId;

          rows.push({
            type: 'task',
            taskId: taskOccurrenceId
              ? `${task.id}__${(task as TaskTypeWithOccurrence).taskOccurrenceId}`
              : task.id,
            forHeader: plan,
          });
        }
      }
    });

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collapsedHeader,
    pagesStore.pages.length,
    tasksStore.loading,
    taskOccurrencesStore.loading,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (filters as any).toJSON(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (displaySettings as any).toJSON(),
  ]);

  return rows;
};
