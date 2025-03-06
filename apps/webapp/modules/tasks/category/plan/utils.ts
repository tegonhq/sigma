import { format, addDays, endOfTomorrow } from 'date-fns';
import React from 'react';

import { type IssueRow } from 'modules/tasks/utils';

import type { PageType } from 'common/types';

import { useApplication } from 'hooks/application';

import { useContextStore } from 'store/global-context-provider';

const findTaskIds = (node: {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any[];
  attrs: { id: string };
}): string[] => {
  const taskIds: string[] = [];

  // If this node is a task, add its ID
  if (node.type === 'task') {
    taskIds.push(node.attrs.id);
  }

  // Recursively search through content array if it exists
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      taskIds.push(...findTaskIds(child));
    }
  }

  return taskIds;
};

export const useTaskRows = (collapsedHeader: Record<string, boolean>) => {
  const { displaySettings } = useApplication();
  const { pagesStore } = useContextStore();
  const planCategories = ['Today', 'Tomorrow', 'Rest of the week', 'Later'];

  const getAllPages = (dates: string[]) => {
    return pagesStore.getDailyPageWithDateArray(dates);
  };

  const getTasksForPage = (page: PageType): string[] => {
    if (page && page.description) {
      const description = JSON.parse(page.description);
      const tasksExtension = description.content[0];
      return findTaskIds(tasksExtension);
    }

    return [];
  };

  const getTasksForPlan = (
    plan: string,
    pages: PageType[],
    weekDates: string[],
  ) => {
    if (plan === 'Today') {
      const today = format(new Date(), 'dd-MM-yyyy');
      const planPages = pages.filter((page) => page.title === today);

      return planPages.flatMap((page) => getTasksForPage(page));
    }

    if (plan === 'Tomorrow') {
      const tomorrow = format(endOfTomorrow(), 'dd-MM-yyyy');
      const planPages = pages.filter((page) => page.title === tomorrow);

      return planPages.flatMap((page) => getTasksForPage(page));
    }

    if (plan === 'Rest of the week') {
      const restOfWeekDates = weekDates.slice(2);
      const planPages = restOfWeekDates.flatMap((date) =>
        pages.filter((page) => page.title === date),
      );

      return planPages.flatMap((page) => getTasksForPage(page));
    }

    return [];
  };

  const rows = React.useMemo(() => {
    const rows: IssueRow[] = [];
    // Create array of dates for a week
    const weekDates = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(new Date(), index);
      return format(date, 'dd-MM-yyyy');
    });

    const pages = getAllPages(weekDates);
    planCategories.forEach((plan) => {
      const tasks = getTasksForPlan(plan, pages, weekDates);
      rows.push({
        type: 'header',
        key: plan,
        count: tasks.length,
      });

      for (const task of tasks) {
        rows.push({
          type: 'task',
          taskId: task,
          forHeader: plan,
        });
      }
    });

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsedHeader, pagesStore.pages]);

  return rows;
};
