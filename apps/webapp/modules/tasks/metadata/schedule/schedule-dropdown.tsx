import { Badge, cn, Cycle } from '@redplanethq/ui';
import { format, isThisWeek, isToday, isTomorrow } from 'date-fns';
import { sort } from 'fast-sort';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { DailogViewsContext, DialogType } from 'modules/dialog-views-provider';

import { TooltipWrapper } from 'common/tooltip';
import type { TaskOccurrenceType, TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export enum ScheduleDropdownVariant {
  DEFAULT = 'DEFAULT',
  SHORT = 'SHORT',
}

interface ScheduleDropdownProps {
  task: TaskType;
  variant?: ScheduleDropdownVariant;
  taskOccurrenceId?: string;
}

export const ScheduleDropdown = observer(
  ({
    task,
    variant = ScheduleDropdownVariant.DEFAULT,
    taskOccurrenceId,
  }: ScheduleDropdownProps) => {
    const { openDialog } = React.useContext(DailogViewsContext);
    const { taskOccurrencesStore } = useContextStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const occurrences =
      taskOccurrencesStore.getTaskOccurrencesForTask(task.id) ?? [];
    // Get yesterday's end of day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    // Filter and sort occurrences after yesterday
    const sortedOccurrences = sort(
      occurrences.filter((occ) => new Date(occ.startTime) > yesterday),
    ).by([{ asc: (u) => u.startTime }]);

    const firstOccurrence = sortedOccurrences[0];
    const passedTaskOccurrence = taskOccurrenceId
      ? occurrences.find((occ) => occ.id === taskOccurrenceId)
      : undefined;

    const formatStartTime = (startTime: string) => {
      const date = new Date(startTime);
      const dayName = format(date, 'EEEE');
      const isCurrentWeek = isThisWeek(date);
      const now = new Date();

      if (isToday(date)) {
        return 'Today';
      }

      // Skip if date is before today
      if (date < new Date(now.setHours(0, 0, 0, 0))) {
        return null;
      }

      if (isTomorrow(date)) {
        return 'Tomorrow';
      }

      if (isCurrentWeek) {
        return dayName;
      }

      return `${dayName}, ${format(date, 'dd-MM-yyyy')}`;
    };

    const getScheduleForOccurrence = (taskOccurrence: TaskOccurrenceType) => {
      return (
        <Badge
          variant="secondary"
          className={cn(
            'flex items-center gap-1 shrink min-w-[0px] text-sm',
            variant !== ScheduleDropdownVariant.SHORT && 'h-7 px-2 text-base',
          )}
        >
          <Clock size={variant === ScheduleDropdownVariant.SHORT ? 12 : 14} />
          {formatStartTime(taskOccurrence.startTime)}
        </Badge>
      );
    };

    const getSchedule = () => {
      if (firstOccurrence && !task.startTime && firstOccurrence?.startTime) {
        return getScheduleForOccurrence(firstOccurrence);
      }

      if (task.startTime) {
        if (variant === ScheduleDropdownVariant.SHORT) {
          return (
            <TooltipWrapper tooltip={task.scheduleText}>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 shrink min-w-[0px] text-sm"
              >
                <Cycle size={14} />
              </Badge>
            </TooltipWrapper>
          );
        }

        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 shrink min-w-[0px] h-7 px-2"
          >
            <Cycle size={16} /> {task.scheduleText}
          </Badge>
        );
      }

      if (variant === ScheduleDropdownVariant.SHORT) {
        return null;
      }

      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 shrink min-w-[0px] h-7 px-2"
        >
          <Clock size={16} />
        </Badge>
      );
    };

    const schedule = getSchedule();

    if (!schedule) {
      return null;
    }

    return (
      <div className="flex gap-1">
        <div
          onClick={(e) => {
            e.stopPropagation();
            openDialog(DialogType.SCHEDULE);
          }}
        >
          {passedTaskOccurrence
            ? getScheduleForOccurrence(passedTaskOccurrence)
            : schedule}
        </div>
        {passedTaskOccurrence && <div>{schedule}</div>}
      </div>
    );
  },
);
