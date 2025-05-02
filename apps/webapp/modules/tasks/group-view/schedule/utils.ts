/* eslint-disable react-hooks/exhaustive-deps */
import { format, addDays, endOfTomorrow } from 'date-fns';
import { sort } from 'fast-sort';
import React from 'react';

import { filterTasksNoHook, type IssueRow } from 'modules/tasks/utils';

import type { PageType, TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

import { useContextStore } from 'store/global-context-provider';

interface TaskTypeWithOccurrence extends TaskType {
  taskOccurrenceId: string;
}

export const useTaskRows = (collapsedHeader: Record<string, boolean>) => {
  const { pagesStore, taskOccurrencesStore, tasksStore } = useContextStore();
  const { filters, displaySettings } = useApplication();

  // Memoize planCategories since it's static
  const planCategories = React.useMemo(
    () => ['Today', 'Tomorrow', 'Rest of the week', 'Later'] as const,
    [],
  );

  // Memoize date calculations
  const dates = React.useMemo(() => {
    const today = new Date();
    const tomorrow = format(endOfTomorrow(), 'dd-MM-yyyy');
    const daysUntilEndOfWeek = 7 - today.getDay();
    const weekDates = Array.from({ length: daysUntilEndOfWeek }, (_, index) =>
      format(addDays(today, index), 'dd-MM-yyyy'),
    );

    return {
      today: format(today, 'dd-MM-yyyy'),
      tomorrow,
      weekDates,
      restOfWeekDates: weekDates.filter(
        (date) => date !== format(today, 'dd-MM-yyyy') && date !== tomorrow,
      ),
    };
  }, []);

  const getAllPages = (dates: string[]) => {
    return pagesStore.getDailyPageWithDateArray(dates);
  };

  // Memoize pages to prevent recalculation
  const pages = React.useMemo(
    () => getAllPages(dates.weekDates),
    [dates.weekDates, pagesStore.pages.length],
  );

  const getTasksForPage = (pageId: string): TaskTypeWithOccurrence[] => {
    if (pageId) {
      const taskOccurrences =
        taskOccurrencesStore.getTaskOccurrencesForPage(pageId);

      if (!taskOccurrences || taskOccurrences?.length === 0) {
        return [];
      }

      const tasks = taskOccurrences.map((occurrence) => {
        return {
          taskOccurrenceId: occurrence.id,
          ...tasksStore.getTaskWithId(occurrence.taskId),
        };
      });

      return tasks;
    }

    return [];
  };

  const getTasksForPlan = (
    plan: string,
    pages: PageType[],
    currentRows: TaskType[],
  ) => {
    if (plan === 'Today') {
      const planPages = pages.filter((page) => page.title === dates.today);
      return planPages.flatMap((page) => getTasksForPage(page.id));
    }

    if (plan === 'Tomorrow') {
      const planPages = pages.filter((page) => page.title === dates.tomorrow);
      return planPages.flatMap((page) => getTasksForPage(page.id));
    }

    if (plan === 'Rest of the week') {
      const planPages = dates.restOfWeekDates.flatMap((date) =>
        pages.filter((page) => page.title === date),
      );

      return planPages.flatMap((page) => getTasksForPage(page.id));
    }

    return tasksStore.tasks.filter(
      (task) => !currentRows.find((row) => row.id === task.id),
    );
  };

  const rows = React.useMemo(() => {
    const rows: IssueRow[] = [];
    let existingTasks: TaskType[] = [];

    planCategories.forEach((plan) => {
      const tasks = getTasksForPlan(plan, pages, existingTasks);

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
