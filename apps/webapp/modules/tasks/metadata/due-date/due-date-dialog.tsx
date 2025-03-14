import {
  BlockedLine,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Fire,
  Loader,
} from '@tegonhq/ui';
import { endOfDay, addDays, endOfWeek, formatISO } from 'date-fns';
import React from 'react';

import {
  useGetTaskScheduleMutation,
  useUpdateTaskMutation,
} from 'services/tasks';

interface DueDateDialogProps {
  taskIds?: string[];
  onClose: () => void;
}

interface DueDateSample {
  text: string;
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
      return endOfDay(addDays(now, 7)).toISOString();

    default:
      throw new Error('Invalid schedule type');
  }
};

const dueDateSamples: DueDateSample[] = [
  { text: 'Remove due', schedule: undefined },
  {
    text: 'Today',
    schedule: {
      dueDate: getScheduleDate('today'),
    },
  },
  {
    text: 'Tomorrow',
    schedule: {
      dueDate: getScheduleDate('tomorrow'),
    },
  },
  {
    text: 'End of this week',
    schedule: {
      dueDate: getScheduleDate('endOfWeek'),
    },
  },
  {
    text: 'In one week',
    schedule: {
      dueDate: getScheduleDate('inOneWeek'),
    },
  },
];

export const DueDateDialog = ({ onClose, taskIds }: DueDateDialogProps) => {
  const [value, setValue] = React.useState('');

  const now = new Date(); // Get current local time
  const localISOString = formatISO(now, { representation: 'complete' });

  const { mutate: updateTask } = useUpdateTaskMutation({});
  const { mutate: getTaskSchedule, isLoading } = useGetTaskScheduleMutation({});

  const getTaskAndOccurrence = (taskIdWithOccurrence: string) => {
    const taskId = taskIdWithOccurrence.split('__')[0];
    const taskOccurrenceId = taskIdWithOccurrence.split('__')[1];

    return { taskId, taskOccurrenceId };
  };
  const onCommand = (dueDate: DueDateSample) => {
    if (dueDate.text === 'Remove schedule') {
      taskIds.forEach((taskIdWithOccurrence) => {
        const { taskId } = getTaskAndOccurrence(taskIdWithOccurrence);
        updateTask({
          taskId,
          dueDate: null,
        });
      });

      onClose();
    }

    if (dueDate.schedule) {
      taskIds.forEach((taskIdWithOccurrence) => {
        const { taskId } = getTaskAndOccurrence(taskIdWithOccurrence);

        updateTask({
          taskId,
          dueDate: dueDate.schedule.dueDate,
        });
      });
      onClose();
    } else {
      getTaskSchedule(
        {
          text: dueDate.text,
          currentTime: localISOString,
        },
        {
          onSuccess: (data) => {
            if (data.dueDate) {
              taskIds.forEach((taskIdWithOccurrence) => {
                const { taskId } = getTaskAndOccurrence(taskIdWithOccurrence);

                updateTask({
                  taskId,
                  dueDate: data.dueDate,
                });
              });
              onClose();
            }
          },
        },
      );
    }
  };

  const getIcon = (dueDate: DueDateSample) => {
    if (dueDate.text === 'Remove due') {
      return <BlockedLine size={14} className="shrink-0" />;
    }

    return <Fire size={14} className="shrink-0" />;
  };

  const filteredDueDateSamples = dueDateSamples.filter((dueDate) =>
    dueDate.text.toLowerCase().includes(value.toLowerCase()),
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
        placeholder="Due by tomorrow"
        className="rounded-md h-10"
        value={value}
        autoFocus
        onValueChange={(value: string) => setValue(value)}
      />

      {isLoading ? (
        <Loader text="thinking..." />
      ) : (
        <CommandList className="p-2 flex-1 max-h-[300px]">
          <CommandEmpty>Example: Due by 10pm</CommandEmpty>

          {filteredDueDateSamples
            .filter((dueDate) =>
              dueDate.text.toLowerCase().includes(value.toLowerCase()),
            )
            .map((dueDate, index) => (
              <CommandItem
                onSelect={() => onCommand(dueDate)}
                key={index}
                className="flex gap-1 items-center py-2"
              >
                <div className="inline-flex items-center gap-2 min-w-[0px] w-full">
                  {getIcon(dueDate)}
                  <div className="truncate grow"> {dueDate.text}</div>
                </div>
              </CommandItem>
            ))}

          {filteredDueDateSamples.length === 0 && (
            <CommandItem
              onSelect={() => onCommand({ text: value })}
              key={filteredDueDateSamples.length + 1}
              className="flex gap-1 items-center py-2"
            >
              AI: {value}
            </CommandItem>
          )}
        </CommandList>
      )}
    </CommandDialog>
  );
};
