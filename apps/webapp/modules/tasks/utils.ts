import type { IntegrationDefinition } from '@sigma/types';

import type { TaskType } from 'common/types';

import type { IPCRenderer } from 'hooks/ipc';

// Add this helper function above the TaskCategory component
export const getStatusPriority = (status: string) => {
  switch (status) {
    case 'Done':
      return 1;
    case 'In Progress':
      return 3;
    case 'Todo':
      return 2;
    default:
      return 0;
  }
};

export const getIntegrationURL = async (
  ipc: IPCRenderer,
  integration: IntegrationDefinition,
) => {
  if (!ipc) {
    return `${integration.url}/frontend/index.js`;
  }

  const integrationsURL = await ipc.getIntegrationsFolder();

  const url = `http://localhost:8000/local/${integrationsURL}/${integration.name}/${integration.version}/frontend/index.js`;

  return url;
};

type IssueRow =
  | { type: 'header'; key: string }
  | { type: 'task'; taskId: string };

export const getTasksRows = (
  tasks: TaskType[],
  property: string,
  keys: string[],
  showEmptyGroups: boolean,
  propertyArray: boolean = false,
): IssueRow[] => {
  // Use Map for better performance with string keys
  const groupedTasks = new Map<string, TaskType[]>();
  keys.forEach((key) => groupedTasks.set(key, []));
  const noValueRows: TaskType[] = [];

  // Group tasks in a single pass
  tasks.forEach((task) => {
    if (!propertyArray) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propertyValue = (task as any)[property] as string;
      if (!propertyValue) {
        noValueRows.push(task);
      } else {
        const propertyKey = keys.find((key: string) =>
          key.includes(propertyValue),
        );
        groupedTasks.get(propertyKey)?.push(task);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propertyValue = (task as any)[property] as string[];
      if (propertyValue.length === 0) {
        noValueRows.push(task);
      }

      if (propertyValue.length > 0) {
        propertyValue.forEach((value) => {
          groupedTasks.get(value)?.push(task);
        });
      }
    }
  });

  // Pre-allocate result array with estimated size
  const estimatedSize = keys.length + tasks.length;
  const result: IssueRow[] = Array(estimatedSize);
  let index = 0;

  // Build result array in a single pass
  keys.forEach((key) => {
    const groupTasks = groupedTasks.get(key) || [];

    // Skip empty groups if showEmptyGroups is false
    if (showEmptyGroups || groupTasks.length > 0) {
      result[index++] = { type: 'header', key };

      for (const task of groupTasks) {
        result[index++] = {
          type: 'task',
          taskId: task.id,
        };
      }
    }
  });

  // Add no-value section if there are any issues without values
  if (noValueRows.length > 0) {
    result[index++] = { type: 'header', key: 'no-value' };

    for (const task of noValueRows) {
      result[index++] = {
        type: 'task',
        taskId: task.id,
      };
    }
  }

  return result.slice(0, index);
};
