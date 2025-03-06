import type { IntegrationDefinition } from '@sigma/types';

import { sort } from 'fast-sort';
import React from 'react';

import type { TaskType } from 'common/types';

import { useApplication } from 'hooks/application';
import type { IPCRenderer } from 'hooks/ipc';

import {
  FilterTypeEnum,
  TimeBasedFilterEnum,
  type DisplaySettingsModelType,
  type FilterModelTimeBasedType,
  type FilterModelType,
  type FiltersModelType,
} from 'store/application';

import { statuses } from './status-dropdown';

// Add this helper function above the TaskCategory component
export const getStatusPriority = (status: string) => {
  switch (status) {
    case 'Done':
      return 1;
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

  const url = `http://localhost:53081/local/${integrationsURL}/${integration.name}/${integration.version}/frontend/index.js`;

  return url;
};

export type IssueRow =
  | { type: 'header'; key: string; count: number }
  | { type: 'task'; taskId: string; forHeader: string };

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
      result[index++] = { type: 'header', key, count: groupTasks.length };

      for (const task of groupTasks) {
        result[index++] = {
          type: 'task',
          taskId: task.id,
          forHeader: key,
        };
      }
    }
  });

  // Add no-value section if there are any tasks without values
  if (noValueRows.length > 0) {
    result[index++] = {
      type: 'header',
      key: 'no-value',
      count: noValueRows.length,
    };

    for (const task of noValueRows) {
      result[index++] = {
        type: 'task',
        taskId: task.id,
        forHeader: 'no-value',
      };
    }
  }

  return result.slice(0, index);
};

interface FilterNormalType extends FilterModelType {
  key: string;
}

interface FilterTimeBasedType extends FilterModelTimeBasedType {
  key: string;
}

type FilterType = FilterNormalType | FilterTimeBasedType;

export function getFilters(
  filters: FiltersModelType = {},
  displaySettings: DisplaySettingsModelType,
) {
  const { status } = filters;
  const { completedFilter } = displaySettings;

  const finalFilters: FilterType[] = [];

  if (status) {
    finalFilters.push({
      key: 'status',
      filterType: status.filterType,
      value: status.value,
    });
  }

  if (
    completedFilter &&
    (completedFilter === TimeBasedFilterEnum.PastDay ||
      completedFilter === TimeBasedFilterEnum.PastWeek)
  ) {
    finalFilters.push({
      key: 'completed_updatedAt',
      filterType: completedFilter,
    });
  }

  if (completedFilter && completedFilter === TimeBasedFilterEnum.None) {
    const filteredStatus = statuses.filter(
      (status) => status === 'Done' || status === 'Canceled',
    );

    finalFilters.push({
      key: 'status',
      filterType: FilterTypeEnum.IS_NOT,
      value: filteredStatus,
    });
  }

  return finalFilters;
}

export function filterTask(task: TaskType, filter: FilterType) {
  // TODO: Fix the type later
  const { key, value, filterType } = filter as FilterNormalType;
  const castedValue = value as string[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldValue = (task as any)[key];

  switch (filterType) {
    case FilterTypeEnum.IS:
      return castedValue.includes(fieldValue);
    case FilterTypeEnum.IS_NOT:
      return !castedValue.includes(fieldValue);
    case FilterTypeEnum.INCLUDES:
      return castedValue.some((value) => fieldValue.includes(value));
    case FilterTypeEnum.EXCLUDES:
      return !castedValue.some((value) => fieldValue.includes(value));
    case FilterTypeEnum.UNDEFINED:
      return fieldValue === null || fieldValue === undefined;
    default:
      return true; // No filter, return all tasks
  }
}

export function filterTimeBasedIssue(task: TaskType, filter: FilterType) {
  // TODO: Fix the type later
  const { key, filterType } = filter as FilterTimeBasedType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldValue = (task as any)[key];

  // Handle time-based filters
  if (Object.values(TimeBasedFilterEnum).includes(filterType)) {
    const now = new Date().getTime();

    switch (filterType) {
      case TimeBasedFilterEnum.PastDay:
        return new Date(fieldValue).getTime() >= now - 24 * 60 * 60 * 1000; // Last 24 hours
      case TimeBasedFilterEnum.PastWeek:
        return new Date(fieldValue).getTime() >= now - 7 * 24 * 60 * 60 * 1000; // Last 7 days
    }
  }

  return true;
}

const isCompleted = (status: string) => {
  return status === 'Done' || status === 'Canceled';
};

export function filterTasks(tasks: TaskType[], filters: FilterType[]) {
  return tasks.filter((task: TaskType) => {
    return filters.every((filter) => {
      switch (filter.key) {
        case 'updatedAt': {
          return filterTimeBasedIssue(task, filter);
        }

        case 'completed_updatedAt': {
          if (!isCompleted(task.status)) {
            return true;
          }

          return (
            isCompleted(task.status) &&
            filterTimeBasedIssue(task, { ...filter, key: 'updatedAt' })
          );
        }

        default:
          return filterTask(task, filter);
      }
    });
  });
}

export function useFilterTasks(tasks: TaskType[]): TaskType[] {
  const { filters, displaySettings } = useApplication();

  return React.useMemo(() => {
    const computedFilters = getFilters(filters, displaySettings);

    const filteredTasks = filterTasks(tasks, computedFilters);

    return sort(filteredTasks).by({ desc: (task: TaskType) => task.updatedAt });
    // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any
  }, [(filters as any).toJSON(), (displaySettings as any).toJSON(), tasks]);
}

export const hasMoreInfo = (task: TaskType) => {
  if (task.listId || task.startTime || task.endTime) {
    return true;
  }

  return false;
};
