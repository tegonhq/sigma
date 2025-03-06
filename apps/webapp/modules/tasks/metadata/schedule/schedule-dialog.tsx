import {
  BlockedLine,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Cycle,
  Loader,
} from '@tegonhq/ui';
import { endOfDay, addDays, endOfWeek, addWeeks, formatISO } from 'date-fns';
import { Clock } from 'lucide-react';
import React from 'react';

import {
  useGetTaskScheduleMutation,
  useUpdateTaskMutation,
} from 'services/tasks';

interface ScheduleDialogProps {
  taskIds?: string[];
  onClose: () => void;
}

interface ScheduleSample {
  text: string;
  isRecurring: boolean;
  status?: 'Todo';
  schedule?:
    | {
        dueDate?: string;
      }
    | undefined;
}

export const getScheduleDate = (
  type: 'today' | 'tomorrow' | 'endOfWeek' | 'inOneWeek',
): string => {
  const now = new Date();

  switch (type) {
    case 'today':
      return endOfDay(now).toISOString();

    case 'tomorrow':
      return endOfDay(addDays(now, 1)).toISOString();

    case 'endOfWeek':
      return endOfWeek(now).toISOString();

    case 'inOneWeek':
      return endOfDay(addWeeks(now, 1)).toISOString();

    default:
      throw new Error('Invalid schedule type');
  }
};

const scheduleSamples: ScheduleSample[] = [
  { text: 'Remove schedule', isRecurring: false, schedule: undefined },
  {
    text: 'Today',
    isRecurring: false,
    schedule: {
      dueDate: getScheduleDate('today'),
    },
  },
  {
    text: 'Tomorrow',
    isRecurring: false,
    schedule: {
      dueDate: getScheduleDate('tomorrow'),
    },
  },
  {
    text: 'End of this week',
    isRecurring: false,
    schedule: {
      dueDate: getScheduleDate('endOfWeek'),
    },
  },

  {
    text: 'In one week',
    isRecurring: false,
    schedule: {
      dueDate: getScheduleDate('inOneWeek'),
    },
  },

  { text: 'Tomorrow at 10 AM', isRecurring: false },
  { text: 'Every Monday at 9 AM', isRecurring: true },
  { text: 'Next Friday at 3 PM', isRecurring: false },
  { text: 'Daily at 8 AM', isRecurring: true },
  { text: 'Every weekday at 6 PM', isRecurring: true },
  { text: 'On March 15 at 2 PM', isRecurring: false },
  { text: 'Every first Monday of the month at 10 AM', isRecurring: true },
  { text: 'Every weekend at 5 PM', isRecurring: true },
  { text: 'Next Wednesday from 2 PM to 4 PM', isRecurring: false },
  { text: 'Every year on July 4 at noon', isRecurring: true },
];

export const ScheduleDialog = ({ onClose, taskIds }: ScheduleDialogProps) => {
  const [value, setValue] = React.useState('');

  const now = new Date(); // Get current local time
  const localISOString = formatISO(now, { representation: 'complete' });

  const { mutate: updateIssue } = useUpdateTaskMutation({});
  const { mutate: getTaskSchedule, isLoading } = useGetTaskScheduleMutation({});
  const onCommand = (schedule: ScheduleSample) => {
    if (schedule.text === 'Remove schedule') {
      taskIds.forEach((taskId) => {
        updateIssue({
          taskId,
          dueDate: null,
          recurrence: [],
          scheduleText: null,
          startTime: null,
          endTime: null,
        });
      });

      onClose();
    }

    if (schedule.schedule) {
      taskIds.forEach((taskId) => {
        updateIssue({
          taskId,
          dueDate: schedule.schedule.dueDate,
          recurrence: [],
          scheduleText: null,
          startTime: null,
          endTime: null,
        });
      });
      onClose();
    } else {
      getTaskSchedule(
        {
          text: schedule.text,
          currentTime: localISOString,
        },
        {
          onSuccess: (data) => {
            taskIds.forEach((taskId) => {
              updateIssue({
                taskId,
                dueDate: data.dueDate ? data.dueDate : null,
                status: 'Todo',
                recurrence: data.recurrenceRule ? [data.recurrenceRule] : [],
                scheduleText: data.scheduleText ? data.scheduleText : null,
                startTime: data.startTime ? data.startTime : null,
                endTime: data.endTime ? data.endTime : null,
              });
            });

            onClose();
          },
        },
      );
    }
  };

  const getIcon = (schedule: ScheduleSample) => {
    if (schedule.text === 'Remove schedule') {
      return <BlockedLine size={14} className="shrink-0" />;
    }

    return <Clock size={14} className="shrink-0" />;
  };

  const getRecurringIcon = (isRecurring: boolean) => {
    if (isRecurring) {
      return <Cycle size={16} className="shrink-0" />;
    }

    return null;
  };

  const filteredScheduleSamples = scheduleSamples.filter((schedule) =>
    schedule.text.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <CommandDialog
      open
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
      commandProps={{
        className: 'border-border border w-[600px]',
        shouldFilter: false,
      }}
    >
      <div className="p-2 flex justify-start w-full">
        <div>
          <div className="bg-accent rounded p-2 py-1 flex gap-2">
            <div>{taskIds.length} tasks</div>
          </div>
        </div>
      </div>
      <CommandInput
        placeholder="Due by 10pm | Every day at 9"
        className="rounded-md h-10"
        value={value}
        autoFocus
        onValueChange={(value: string) => setValue(value)}
      />

      {isLoading ? (
        <Loader text="Generating schedule..." />
      ) : (
        <CommandList className="p-2 flex-1 max-h-[300px]">
          <CommandEmpty>
            You can write the schedule we take care of the rest
          </CommandEmpty>

          {filteredScheduleSamples
            .filter((schedule) =>
              schedule.text.toLowerCase().includes(value.toLowerCase()),
            )
            .map((schedule, index) => (
              <CommandItem
                onSelect={() => onCommand(schedule)}
                key={index}
                className="flex gap-1 items-center py-2"
              >
                <div className="inline-flex items-center gap-2 min-w-[0px] w-full">
                  {getIcon(schedule)}
                  <div className="truncate grow"> {schedule.text}</div>
                  {getRecurringIcon(schedule.isRecurring)}
                </div>
              </CommandItem>
            ))}

          {filteredScheduleSamples.length === 0 && (
            <CommandItem
              onSelect={() => onCommand({ text: value, isRecurring: false })}
              key={filteredScheduleSamples.length + 1}
              className="flex gap-1 items-center py-2"
            >
              Schedule for: {value}
            </CommandItem>
          )}
        </CommandList>
      )}
    </CommandDialog>
  );
};
