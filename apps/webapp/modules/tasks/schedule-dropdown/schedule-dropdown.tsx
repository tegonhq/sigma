import {
  Popover,
  Button,
  Command,
  CommandInput,
  PopoverContent,
  PopoverTrigger,
  CommandGroup,
  CommandItem,
  PopoverPortal,
  Badge,
  Cycle,
} from '@tegonhq/ui';
import type { TaskType } from 'common/types';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

export enum ScheduleDropdownVariant {
  DEFAULT = 'DEFAULT',
  SHORT = 'SHORT',
}

interface ScheduleDropdownProps {
  task: TaskType;
  variant?: ScheduleDropdownVariant;
}

export const ScheduleDropdown = observer(
  ({
    task,
    variant = ScheduleDropdownVariant.DEFAULT,
  }: ScheduleDropdownProps) => {
    const getSchedule = () => {
      if (task.startTime) {
        if (variant === ScheduleDropdownVariant.SHORT) {
          return (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 shrink min-w-[0px]"
            >
              <Cycle size={16} />
            </Badge>
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
        }}
      >
        {getSchedule()}
      </div>
    );
  },
);
