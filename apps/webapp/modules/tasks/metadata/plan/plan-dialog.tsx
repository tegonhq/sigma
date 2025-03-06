import {
  AI,
  BlockedLine,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Loader,
} from '@tegonhq/ui';
import { endOfDay, addDays, endOfWeek, formatISO } from 'date-fns';
import { Clock } from 'lucide-react';
import React from 'react';

import {
  useGetTaskScheduleMutation,
  useUpdateTaskMutation,
} from 'services/tasks';

interface PlanDialogProps {
  taskIds?: string[];
  onClose: () => void;
}

interface PlanSample {
  text: string;
  plan?: string;
}

export const getPlanDate = (
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

    default:
      throw new Error('Invalid plan type');
  }
};

const planSamples: PlanSample[] = [
  { text: 'Remove plan', plan: undefined },
  {
    text: 'Today',
    plan: getPlanDate('today'),
  },
  {
    text: 'Tomorrow',
    plan: getPlanDate('tomorrow'),
  },
  {
    text: 'End of week',
    plan: getPlanDate('endOfWeek'),
  },
  {
    text: 'Ask sigma',
  },
];

export const PlanDialog = ({ onClose, taskIds }: PlanDialogProps) => {
  const [value, setValue] = React.useState('');

  const now = new Date(); // Get current local time
  const localISOString = formatISO(now, { representation: 'complete' });

  const { mutate: updateIssue } = useUpdateTaskMutation({});
  const { mutate: getTaskSchedule, isLoading } = useGetTaskScheduleMutation({});
  const onCommand = (plan: PlanSample) => {
    if (plan.text === 'Remove plan') {
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

  const getIcon = (schedule: PlanSample) => {
    if (schedule.text === 'Remove plan') {
      return <BlockedLine size={14} className="shrink-0" />;
    }

    if (schedule.text === 'Ask sigma') {
      return <AI size={14} className="shrink-0" />;
    }

    return <Clock size={14} className="shrink-0" />;
  };

  const filteredPlanSamples = planSamples.filter((plan) =>
    plan.text.toLowerCase().includes(value.toLowerCase()),
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
        placeholder="When will you work on (DD-MM-YY)"
        className="rounded-md h-10"
        value={value}
        autoFocus
        onValueChange={(value: string) => setValue(value)}
      />

      {isLoading ? (
        <Loader text="Generating plan..." />
      ) : (
        <CommandList className="p-2 flex-1 max-h-[300px]">
          <CommandEmpty>
            You can write the date or day we take care of the rest
          </CommandEmpty>

          {filteredPlanSamples
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
                </div>
              </CommandItem>
            ))}

          {filteredPlanSamples.length === 0 && (
            <CommandItem
              onSelect={() => onCommand({ text: value })}
              key={filteredPlanSamples.length + 1}
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
