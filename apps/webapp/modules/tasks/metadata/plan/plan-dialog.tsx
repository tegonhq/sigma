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
import { endOfDay, addDays, endOfWeek, startOfDay } from 'date-fns';
import { sort } from 'fast-sort';
import { Clock } from 'lucide-react';
import React from 'react';

import { useUpdateTaskOccurrenceMutation } from 'services/task-occurrence';

import { useContextStore } from 'store/global-context-provider';

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

const useTaskOccurrenceIds = (taskIds: string[]) => {
  const { taskOccurrencesStore } = useContextStore();
  console.log(taskIds);
  return React.useMemo(() => {
    const taskOccurrenceToTask: Record<string, string> = {};

    taskIds.forEach((taskId: string) => {
      const occurrences =
        taskOccurrencesStore.getTaskOccurrencesForTask(taskId) ?? [];

      const sortedOccurrences = sort(
        occurrences.filter((occ) => {
          const date = new Date(occ.startTime);
          const now = new Date();
          return date >= new Date(now.setHours(0, 0, 0, 0));
        }),
      ).by([{ asc: (u) => u.startTime }]);
      const firstOccurrence = sortedOccurrences[0];

      if (firstOccurrence?.id) {
        taskOccurrenceToTask[taskId] = firstOccurrence.id;
      }
    });

    return taskOccurrenceToTask;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIds, taskOccurrencesStore.loading]);
};

export const PlanDialog = ({ onClose, taskIds }: PlanDialogProps) => {
  const [value, setValue] = React.useState('');
  const taskOccurrenceToTask = useTaskOccurrenceIds(taskIds);

  console.log(taskOccurrenceToTask);
  const { mutate: updateTaskOccurrence, isLoading } =
    useUpdateTaskOccurrenceMutation({});

  const onCommand = (plan: PlanSample) => {
    if (plan.text === 'Remove plan') {
      // Remove plan

      onClose();
    }

    if (plan.plan) {
      const finalTaskIds: string[] = [];
      const taskOccurrenceIds: string[] = [];

      taskIds.forEach((taskId: string) => {
        console.log(taskOccurrenceToTask[taskId], taskId);
        if (taskOccurrenceToTask[taskId]) {
          taskOccurrenceIds.push(taskOccurrenceToTask[taskId]);
        } else {
          finalTaskIds.push(taskId);
        }
      });

      updateTaskOccurrence({
        taskOccurrenceIds,
        taskIds: finalTaskIds,
        startTime: startOfDay(plan.plan).toISOString(),
        endTime: plan.plan,
      });
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
