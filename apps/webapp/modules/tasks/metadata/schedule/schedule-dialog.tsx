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
import {
  endOfDay,
  addDays,
  endOfWeek,
  addWeeks,
  formatISO,
  startOfDay,
} from 'date-fns';
import { sort } from 'fast-sort';
import { Clock } from 'lucide-react';
import React from 'react';

import {
  useCreateTaskOccurrenceMutation,
  useDeleteTaskOccurrenceMutation,
  useUpdateTaskOccurrenceMutation,
} from 'services/task-occurrence';
import {
  useGetTaskScheduleMutation,
  useUpdateTaskMutation,
} from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

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
        plan?: string;
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
      plan: getScheduleDate('today'),
    },
  },
  {
    text: 'Tomorrow',
    isRecurring: false,
    schedule: {
      plan: getScheduleDate('tomorrow'),
    },
  },
  {
    text: 'End of this week',
    isRecurring: false,
    schedule: {
      plan: getScheduleDate('endOfWeek'),
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
  const { taskOccurrencesStore } = useContextStore();

  const now = new Date(); // Get current local time
  const localISOString = formatISO(now, { representation: 'complete' });

  const { mutate: updateTask } = useUpdateTaskMutation({});
  const { mutate: getTaskSchedule, isLoading } = useGetTaskScheduleMutation({});
  const { mutate: deleteTaskOccurrence } = useDeleteTaskOccurrenceMutation({});
  const { mutate: updateTaskOccurrenceAPI } = useUpdateTaskOccurrenceMutation(
    {},
  );
  const { mutate: createTaskOccurrence } = useCreateTaskOccurrenceMutation({});

  const getTaskAndOccurrence = (taskIdWithOccurrence: string) => {
    const taskId = taskIdWithOccurrence.split('__')[0];
    const taskOccurrenceId = taskIdWithOccurrence.split('__')[1];

    if (!taskIdWithOccurrence) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const occurrences =
        taskOccurrencesStore.getTaskOccurrencesForTask(taskId) ?? [];
      // Get yesterday's end of day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      // Filter and sort occurrences after yesterday
      const sortedOccurrences = sort(
        occurrences.filter((occ) => new Date(occ.startTime) > yesterday),
      ).by([{ desc: (u) => u.startTime }]);

      const firstOccurrence = sortedOccurrences[0];

      return { taskId, taskOccurrenceId: firstOccurrence?.id };
    }

    return { taskId, taskOccurrenceId };
  };

  const updateTaskOccurrence = (taskIdWithOccurrence: string, date: string) => {
    const { taskOccurrenceId, taskId } =
      getTaskAndOccurrence(taskIdWithOccurrence);
    if (taskOccurrenceId) {
      updateTaskOccurrenceAPI({
        taskOccurrenceIds: [taskOccurrenceId],
        startTime: startOfDay(date).toISOString(),
        endTime: endOfDay(date).toISOString(),
      });
    } else {
      createTaskOccurrence({
        startTime: startOfDay(date).toISOString(),
        endTime: endOfDay(date).toISOString(),
        taskIds: [taskId],
      });
    }
  };

  const onCommand = (schedule: ScheduleSample) => {
    if (schedule.text === 'Remove schedule') {
      taskIds.forEach((taskIdWithOccurrence) => {
        const { taskOccurrenceId } = getTaskAndOccurrence(taskIdWithOccurrence);
        if (taskOccurrenceId) {
          deleteTaskOccurrence({
            taskOccurrenceId,
          });
        }
      });

      onClose();
    }

    if (schedule.schedule) {
      taskIds.forEach((taskIdWithOccurrence) => {
        updateTaskOccurrence(taskIdWithOccurrence, schedule.schedule.plan);
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
            if (data.dueDate) {
              return;
            }

            if (data.startTime && !data.recurrenceRule[0]) {
              taskIds.forEach((taskIdWithOccurrence) => {
                updateTaskOccurrence(
                  taskIdWithOccurrence,
                  startOfDay(data.startTime).toISOString(),
                );
              });
              onClose();
              return;
            }

            taskIds.forEach((taskId) => {
              updateTask({
                taskId,
                status: 'Todo',
                recurrence: data.recurrenceRule ? data.recurrenceRule : [],
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
        placeholder="Every day at 9 | work tomorrow"
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
