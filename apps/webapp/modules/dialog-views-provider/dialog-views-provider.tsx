import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { ScheduleDialog } from 'modules/tasks/metadata';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { DueDateDialog } from 'modules/tasks/metadata/due-date';

export enum DialogType {
  SCHEDULE = 'schedule',
  DUEDATE = 'due-date',
}

interface DialogViewsContextType {
  taskIds?: string[];
  dialogType: DialogType | undefined;
  openDialog: (dialogType: DialogType, taskIds: string[]) => void;
  closeDialog: () => void;
}

export const DailogViewsContext =
  React.createContext<DialogViewsContextType>(undefined);

// This handles the shortcut dialogs
// s - schedule
export const DialogViewsProvider = observer(
  ({ children }: { children: React.ReactNode }) => {
    const ComponentType = {
      [DialogType.SCHEDULE]: ScheduleDialog,
      [DialogType.DUEDATE]: DueDateDialog,
    };

    const [dialogOpen, setDialogOpen] = React.useState<DialogType>(undefined);
    const [taskIds, setTaskIds] = React.useState<string[]>([]);
    const { tabs, selectedTasks, hoverTask } = useApplication();
    const firstTab = tabs[0];
    const taskId =
      firstTab.type === TabViewType.MY_TASKS ? firstTab.entity_id : undefined;

    const openDialog = (dialogType: DialogType, taskIds: string[]) => {
      setTaskIds(taskIds);
      setDialogOpen(dialogType);
    };

    const closeDialog = () => {
      setDialogOpen(undefined);
      setTaskIds([]);
    };

    const getDialogComponent = () => {
      const Component = ComponentType[dialogOpen];

      return <Component taskIds={taskIds} onClose={closeDialog} />;
    };

    const getTasks = () => {
      if (taskId) {
        return [taskId];
      }

      if (selectedTasks.length > 0) {
        return selectedTasks;
      }

      if (hoverTask) {
        return [hoverTask];
      }

      return [];
    };

    useHotkeys(
      ['s', 'd'],
      (event) => {
        switch (event.key) {
          case 's':
            setTaskIds(getTasks());
            setDialogOpen(DialogType.SCHEDULE);
            break;
          case 'd':
            setTaskIds(getTasks());
            setDialogOpen(DialogType.DUEDATE);
            break;
        }
      },
      {
        scopes: [SCOPES.Task],
        enabled: getTasks().length > 0,
        preventDefault: true,
      },
    );

    return (
      <DailogViewsContext.Provider
        value={{ taskIds, dialogType: dialogOpen, openDialog, closeDialog }}
      >
        {taskIds.length > 0 && dialogOpen && getDialogComponent()}
        {children}
      </DailogViewsContext.Provider>
    );
  },
);
