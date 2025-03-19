import {
  AI,
  CalendarLine,
  DeleteLine,
  Fire,
  IssuesLine,
  Project,
} from '@tegonhq/ui';
import { parse } from 'date-fns';
import { Check } from 'lucide-react';
import React from 'react';

import { DailogViewsContext, DialogType } from 'modules/dialog-views-provider';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { useTaskOperations } from './use-task-operations';

interface CommandType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
  text: string;
  command: () => void;
}

function isValidDateFormat(dateString: string) {
  // Regular expression to match the dd-mm-yyyy format
  const regex = /^\d{2}-\d{2}-\d{4}$/;

  if (!regex.test(dateString)) {
    return false; // Does not match the basic pattern
  }

  // Split the string into day, month, and year
  const [day, month, year] = dateString.split('-').map(Number);

  // Check if the date is valid
  const date = new Date(year, month - 1, day);

  // Verify if the constructed date matches the input
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export const useSearchCommands = (value: string, onClose: () => void) => {
  const { tasksStore, pagesStore, listsStore } = useContextStore();
  const { updateTabData, tabs, updateTabType, selectedTasks } =
    useApplication();
  const firstTab = tabs[0];
  const { openDialog } = React.useContext(DailogViewsContext);
  const { markComplete, deleteTasks } = useTaskOperations();

  const getTasks = () => {
    if (selectedTasks.length > 0) {
      return selectedTasks;
    }

    return [];
  };

  return React.useMemo(() => {
    const commands: Record<string, CommandType[]> = {};

    commands['default'] = [
      {
        Icon: AI,
        text: 'Ask sigma agent about...',
        command: () => {
          updateTabType(1, TabViewType.AI, {});
          onClose();
        },
      },
      {
        Icon: CalendarLine,
        text: 'Go to today',
        command: () => {
          updateTabType(0, TabViewType.MY_DAY, {
            data: {
              date: new Date(),
            },
          });

          onClose();
        },
      },
    ];

    if (isValidDateFormat(value)) {
      commands['default'] = [
        ...commands['default'],
        {
          Icon: CalendarLine,
          text: `Go to date: ${value}`,
          command: () => {
            updateTabData(0, {
              date: parse(value, 'dd-MM-yyyy', new Date()),
            });
            onClose();
          },
        },
      ];
    }

    if (
      firstTab.type === TabViewType.MY_TASKS &&
      (getTasks().length > 0 || firstTab.entity_id)
    ) {
      commands['Task'] = [
        {
          Icon: CalendarLine,
          text: 'Schedule',
          command: () => {
            onClose();
            openDialog(DialogType.SCHEDULE, getTasks());
          },
        },
        {
          Icon: Fire,
          text: 'Set due date',
          command: () => {
            onClose();
            openDialog(DialogType.DUEDATE, getTasks());
          },
        },
        {
          Icon: Check,
          text: 'Mark completed',
          command: () => {
            onClose();
            markComplete(getTasks());
          },
        },
        {
          Icon: DeleteLine,
          text: 'Delete task',
          command: () => {
            onClose();
            deleteTasks(getTasks());
          },
        },
      ];
    }

    if (value && !isValidDateFormat(value)) {
      const pages = pagesStore.searchPages(value);

      commands['Pages'] = pages.map((page) => {
        const task = tasksStore.getTaskForPage(page.id);
        const list = listsStore.getListWithPageId(page.id);

        if (task) {
          return {
            Icon: IssuesLine,
            text: page.title,
            command: () => {
              updateTabType(0, TabViewType.MY_TASKS, {
                entityId: task.id,
              });

              onClose();
            },
          };
        }

        if (list) {
          return {
            Icon: Project,
            text: page.title,
            command: () => {
              updateTabType(0, TabViewType.LIST, {
                entityId: list.id,
              });

              onClose();
            },
          };
        }

        return {
          Icon: CalendarLine,
          text: page.title,
          command: () => {
            updateTabData(0, {
              date: parse(page.title, 'dd-MM-yyyy', new Date()),
            });

            onClose();
          },
        };
      });
    }

    return commands;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
};
