import { Badge, cn, CodingLine } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { format, isThisWeek, isToday, isTomorrow } from 'date-fns';

import { DailogViewsContext, DialogType } from 'modules/dialog-views-provider';

import { TooltipWrapper } from 'common/tooltip';
import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export enum PlanDropdownVariant {
  DEFAULT = 'DEFAULT',
  SHORT = 'SHORT',
}

interface PlanDropdownProps {
  task: TaskType;
  variant?: PlanDropdownVariant;
}

export const PlanDropdown = observer(
  ({ task, variant = PlanDropdownVariant.DEFAULT }: PlanDropdownProps) => {
    const { openDialog } = React.useContext(DailogViewsContext);
    const { taskOccurrencesStore } = useContextStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const occurrences =
      taskOccurrencesStore.getTaskOccurrencesForTask(task.id) ?? [];

    const sortedOccurrences = sort(occurrences).by([
      { asc: (u) => u.startTime },
    ]);
    const firstOccurrence = sortedOccurrences[0];

    const formatStartTime = (startTime: string) => {
      const date = new Date(startTime);
      const dayName = format(date, 'EEEE');
      const isCurrentWeek = isThisWeek(date);
      const now = new Date();

      // Skip if date is before today
      if (date < new Date(now.setHours(0, 0, 0, 0))) {
        return null;
      }

      if (isToday(date)) {
        return 'Today';
      }

      if (isTomorrow(date)) {
        return 'Tomorrow';
      }

      if (isCurrentWeek) {
        return dayName;
      }

      return `${dayName}, ${format(date, 'dd-MM-yyyy')}`;
    };

    if (task.startTime || task.endTime || task.scheduleText) {
      return null;
    }

    const getPlan = () => {
      if (firstOccurrence?.startTime) {
        return (
          <Badge
            variant="secondary"
            className={cn(
              'flex items-center gap-1 shrink min-w-[0px] text-xs',
              variant !== PlanDropdownVariant.SHORT && 'h-7 px-2 text-base',
            )}
          >
            <Clock size={variant === PlanDropdownVariant.SHORT ? 12 : 14} />
            {formatStartTime(firstOccurrence.startTime)}
          </Badge>
        );
      }

      if (variant === PlanDropdownVariant.SHORT) {
        return null;
      }

      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 shrink min-w-[0px] h-7 px-2"
        >
          <CodingLine size={16} /> Plan
        </Badge>
      );
    };

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          openDialog(DialogType.PLAN, [task.id]);
        }}
      >
        {getPlan()}
      </div>
    );
  },
);
