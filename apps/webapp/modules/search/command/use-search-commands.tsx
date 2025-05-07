import {
  AI,
  CalendarLine,
  DeleteLine,
  DocumentLine,
  Fire,
  IssuesLine,
  Project,
  SettingsLine,
} from '@tegonhq/ui';
import { Check } from 'lucide-react';
import React from 'react';

import { DailogViewsContext, DialogType } from 'modules/dialog-views-provider';
import { useSettings } from 'modules/settings';
import { AddTaskDialogContext } from 'modules/tasks/add-task';

import type { ListType } from 'common/types';
import { RightSideViewContext } from 'layouts/right-side-layout';

import { useApplication } from 'hooks/application';

import { useCreateListMutation } from 'services/lists';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { useTaskOperations } from './use-task-operations';

interface CommandType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
  text: string | React.ReactNode;
  shortcut?: string;
  command: () => void;
}

export const useSearchCommands = (value: string, onClose: () => void) => {
  const { tasksStore, pagesStore, listsStore } = useContextStore();
  const { setDialogOpen } = React.useContext(AddTaskDialogContext);
  const { tabs, updateTabType, selectedTasks } = useApplication();
  const firstTab = tabs[0];
  const { openDialog } = React.useContext(DailogViewsContext);
  const rightViewContext = React.useContext(RightSideViewContext);
  const { markComplete, deleteTasks } = useTaskOperations();
  const { openSettings } = useSettings();
  const { mutate: createList } = useCreateListMutation({
    onSuccess: (data: ListType) => {
      updateTabType(0, TabViewType.LIST, data.id ? { entityId: data.id } : {});
    },
  });

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
          if (rightViewContext && rightViewContext.onOpen) {
            rightViewContext.onOpen('');
            onClose();
          }
        },
      },
      {
        Icon: IssuesLine,
        text: 'Create task',
        shortcut: 'cmd + n',
        command: () => {
          onClose();

          setDialogOpen(true);
        },
      },
      {
        Icon: CalendarLine,
        text: 'Go to today',
        shortcut: 'G + T',
        command: () => {
          updateTabType(0, TabViewType.DAYS, {
            data: {
              date: new Date(),
            },
          });

          onClose();
        },
      },
      {
        Icon: IssuesLine,
        text: 'Go to tasks',
        shortcut: 'G + M',
        command: () => {
          updateTabType(0, TabViewType.MY_TASKS, {});

          onClose();
        },
      },
      {
        Icon: Project,
        text: 'Go to lists',
        shortcut: 'G + L',
        command: () => {
          updateTabType(0, TabViewType.MY_TASKS, {});

          onClose();
        },
      },
      {
        Icon: SettingsLine,
        text: 'Go to settings',
        shortcut: 'G + S',
        command: () => {
          openSettings();
          onClose();
        },
      },
      {
        Icon: Project,
        text: 'Create list',

        command: () => {
          createList();
          onClose();
        },
      },
    ];

    if (value) {
      commands['default'] = [
        ...commands['default'],
        {
          Icon: AI,
          text: `${value} ... ask sigma`,
          command: () => {
            if (rightViewContext && rightViewContext.onOpen) {
              rightViewContext.onOpen(value);
              onClose();
            }
          },
        },
      ];

      commands['settings'] = [
        {
          Icon: DocumentLine,
          text: 'Signals',
          command: () => {
            openSettings('Signals');
            onClose();
          },
        },
        {
          Icon: AI,
          text: 'MCP',
          command: () => {
            openSettings('MCP');
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
          shortcut: 's',
          command: () => {
            onClose();
            openDialog(DialogType.SCHEDULE);
          },
        },
        {
          Icon: Fire,
          text: 'Set due date',
          shortcut: 'd',
          command: () => {
            onClose();
            openDialog(DialogType.DUEDATE);
          },
        },
        {
          Icon: Check,
          text: 'Mark completed',
          shortcut: 'c',
          command: () => {
            onClose();
            markComplete(getTasks());
          },
        },
        {
          Icon: DeleteLine,
          text: 'Delete task',
          shortcut: 'cmd + ⌫',
          command: () => {
            onClose();
            deleteTasks(getTasks());
          },
        },
      ];
    }

    if (value) {
      const pages = pagesStore.searchPages(value);

      commands['Pages'] = pages
        .map((page) => {
          const task = tasksStore.getTaskForPage(page.id);
          const list = listsStore.getListWithPageId(page.id);

          if (task) {
            return {
              Icon: IssuesLine,
              text: page.title,
              key: task.id,
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
              key: list.id,
              command: () => {
                updateTabType(0, TabViewType.LIST, {
                  entityId: list.id,
                });

                onClose();
              },
            };
          }

          return undefined;
        })
        .filter(Boolean);
    }

    return commands;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
};
