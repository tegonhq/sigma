import {
  AI,
  CalendarLine,
  DocumentLine,
  IssuesLine,
  TodoLine,
} from '@tegonhq/ui';
import { parse } from 'date-fns';
import React from 'react';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

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
  const { tasksStore, pagesStore } = useContextStore();
  const { updateTabData, tabs, updateTabType } = useApplication();
  const secondTab = tabs[1];

  return React.useMemo(() => {
    const commands: Record<string, CommandType[]> = {};

    commands['default'] = [
      {
        Icon: AI,
        text: 'Ask sigma agent about...',
        command: () => {
          updateTabType(1, TabViewType.AI);
          onClose();
        },
      },
      {
        Icon: CalendarLine,
        text: 'Go to today',
        command: () => {
          updateTabData(0, {
            date: new Date(),
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
      secondTab.type === TabViewType.MY_TASKS &&
      secondTab.entity_id !== 'my_tasks'
    ) {
      commands['Task'] = [
        {
          Icon: CalendarLine,
          text: 'Set due date',
          command: () => {},
        },
        {
          Icon: TodoLine,
          text: 'Set status',
          command: () => {},
        },
      ];
    }

    if (value && !isValidDateFormat(value)) {
      const pages = pagesStore.searchPages(value);

      commands['Pages'] = pages.map((page) => {
        const task = tasksStore.getTaskForPage(page.id);

        if (task) {
          return {
            Icon: IssuesLine,
            text: page.title,
            command: () => {
              updateTabType(1, TabViewType.MY_TASKS, task.id);

              onClose();
            },
          };
        }

        return {
          Icon: DocumentLine,
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
