import { Button, Close, DeleteLine, Fire, Separator } from '@tegonhq/ui';
import { Check, Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { DialogType } from 'modules/dialog-views-provider';
import { useTaskOperations } from 'modules/search/command/use-task-operations';

import { Shortcut } from 'common/shortcut';
import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

interface ActionBarProps {
  openDialog: (dialogType: DialogType) => void;
}

export const ActionBar = observer(({ openDialog }: ActionBarProps) => {
  const { selectedTasks, clearSelectedTask } = useApplication();
  const { markComplete, deleteTasks } = useTaskOperations();

  useHotkeys(
    ['x', 'c', Key.Escape],
    (event) => {
      switch (event.key) {
        case 'x':
          deleteTasks(selectedTasks);
          break;
        case 'c':
          markComplete(selectedTasks);
          break;
        case Key.Escape:
          clearSelectedTask();
          break;
      }
    },
    {
      scopes: [SCOPES.Task],
      enabled: selectedTasks.length > 0,
      preventDefault: true,
    },
  );

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 shadow-1 rounded-lg bg-background p-2">
      <div className="flex gap-2 items-center">
        <div className="flex items-center">{selectedTasks.length} tasks</div>
        <Separator orientation="vertical" className="h-7" />

        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => {
            openDialog(DialogType.SCHEDULE);
          }}
        >
          <Clock size={16} />
          <Shortcut shortcut="S" className="ml-1" />
        </Button>

        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => {
            openDialog(DialogType.DUEDATE);
          }}
        >
          <Fire size={16} />
          <Shortcut shortcut="D" className="ml-1" />
        </Button>

        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => {
            markComplete(selectedTasks);
          }}
        >
          <Check size={16} />
          <Shortcut shortcut="C" className="ml-1" />
        </Button>

        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => {
            markComplete(selectedTasks);
          }}
        >
          <DeleteLine size={16} />
          <Shortcut shortcut="X" className="ml-1" />
        </Button>

        <Separator orientation="vertical" className="h-7" />
        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => {
            clearSelectedTask();
          }}
        >
          <Close size={16} />
        </Button>
      </div>
    </div>
  );
});
