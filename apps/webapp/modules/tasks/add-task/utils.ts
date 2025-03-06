import { SourceType, type Source } from '@sigma/types';
import { endOfDay, isBefore, startOfDay } from 'date-fns';

export const getPropertiesBasedOnDate = (
  date: Date,
): { status: string; dueDate?: string } => {
  const normalizedDate = startOfDay(date);
  const today = startOfDay(new Date());

  if (isBefore(normalizedDate, today)) {
    return { status: 'Done' };
  }

  return {
    status: 'Todo',
    dueDate: endOfDay(date).toISOString(),
  };
};

export const getCreateTaskPropsOnSource = (
  source: Source,
  date?: Date,
): { status: string; source: Source; parentId?: string; dueDate?: string } => {
  let createTaskProps;

  if (source.type === SourceType.TASK) {
    return { parentId: source.id, source, status: 'Todo' };
  }

  if (date) {
    createTaskProps = getPropertiesBasedOnDate(date);
  }

  return { source, status: createTaskProps.status, ...createTaskProps };
};
