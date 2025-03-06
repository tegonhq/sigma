import { Badge, cn, Cycle, Fire } from '@tegonhq/ui';
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  isPast,
} from 'date-fns';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { DailogViewsContext, DialogType } from 'modules/dialog-views-provider';

import { TooltipWrapper } from 'common/tooltip';
import type { TaskType } from 'common/types';

export enum ScheduleDropdownVariant {
  DEFAULT = 'DEFAULT',
  SHORT = 'SHORT',
}

interface ScheduleDropdownProps {
  task: TaskType;
  variant?: ScheduleDropdownVariant;
}

interface TimeStatus {
  text: string;
  overdue: boolean;
}

const getRelativeTime = (date: Date): TimeStatus => {
  const now = new Date();
  const isOverdue = isPast(date);

  const days = Math.abs(differenceInDays(date, now));
  const hours = Math.abs(differenceInHours(date, now));
  const minutes = Math.abs(differenceInMinutes(date, now));

  let text = '';
  if (days > 0) {
    text = `${days}d`;
  } else if (hours > 0) {
    text = `${hours}h`;
  } else if (minutes > 0) {
    text = `${minutes}m`;
  } else {
    text = 'now';
  }

  return {
    text: isOverdue ? `${text} ago` : text,
    overdue: isOverdue,
  };
};

export const ScheduleDropdown = observer(
  ({
    task,
    variant = ScheduleDropdownVariant.DEFAULT,
  }: ScheduleDropdownProps) => {
    const { openDialog } = React.useContext(DailogViewsContext);

    const getSchedule = () => {
      if (task.dueDate) {
        const timeRelative = getRelativeTime(new Date(task.dueDate));
        const timeText = `${timeRelative.overdue ? '' : 'in'} ${timeRelative.text}`;

        return (
          <Badge
            variant="secondary"
            className={cn(
              'flex items-center gap-1 shrink min-w-[0px] text-xs',
              timeRelative.overdue && 'text-red-600',
              variant !== ScheduleDropdownVariant.SHORT && 'h-7 px-2 text-base',
            )}
          >
            <Fire size={variant === ScheduleDropdownVariant.SHORT ? 12 : 14} />{' '}
            {timeText}
          </Badge>
        );
      }

      if (task.startTime) {
        if (variant === ScheduleDropdownVariant.SHORT) {
          return (
            <TooltipWrapper tooltip={task.scheduleText}>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 shrink min-w-[0px]"
              >
                <Cycle size={16} />
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

      return null;
    };

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          openDialog(DialogType.SCHEDULE, [task.id]);
        }}
      >
        {getSchedule()}
      </div>
    );
  },
);
