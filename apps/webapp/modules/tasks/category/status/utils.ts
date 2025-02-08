import { getTasksRows } from 'modules/tasks/utils';

import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';

export const useTaskRows = (
  tasks: TaskType[],
  collapsedHeader: Record<string, boolean>,
) => {
  const { displaySettings } = useApplication();

  const sortedStatues = ['In Progress', 'Todo', 'Done', 'Canceled'];

  const rows = getTasksRows(
    tasks,
    'status',
    sortedStatues,
    displaySettings.showEmptyGroups,
  );

  const filteredRows = rows.filter((row) => {
    if (row.type === 'task') {
      if (collapsedHeader[row.forHeader]) {
        return false;
      }
    }

    return true;
  });

  return filteredRows;
};
