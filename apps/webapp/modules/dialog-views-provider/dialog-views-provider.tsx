import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { ActionBar } from 'modules/tasks/action-bar';
import { ScheduleDialog } from 'modules/tasks/metadata';
import { DueDateDialog } from 'modules/tasks/metadata/due-date';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

import { DialogType } from './types';

interface DialogViewsContextType {
  dialogType: DialogType | undefined;
  openDialog: (dialogType: DialogType) => void;
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

    const { activeTab, selectedTasks, hoverTask } = useApplication();

    const taskId =
      activeTab.type === TabViewType.MY_TASKS ? activeTab.entity_id : undefined;

    const openDialog = (dialogType: DialogType) => {
      setDialogOpen(dialogType);
    };

    const closeDialog = () => {
      setDialogOpen(undefined);
    };

    const getDialogComponent = () => {
      const Component = ComponentType[dialogOpen];

      return <Component taskIds={getTasks()} onClose={closeDialog} />;
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
            setDialogOpen(DialogType.SCHEDULE);
            break;
          case 'd':
            setDialogOpen(DialogType.DUEDATE);
            break;
        }
      },
      {
        scopes: [SCOPES.Tasks, SCOPES.Task, SCOPES.ASSISTANT],
        enabled: getTasks().length > 0,
        preventDefault: true,
      },
    );

    return (
      <>
        <DailogViewsContext.Provider
          value={{ dialogType: dialogOpen, openDialog, closeDialog }}
        >
          {getTasks().length > 0 && dialogOpen && getDialogComponent()}
          {children}
        </DailogViewsContext.Provider>

        {selectedTasks.length > 0 && <ActionBar openDialog={openDialog} />}
      </>
    );
  },
);
