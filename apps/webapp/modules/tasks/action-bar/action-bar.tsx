import { Button, Fire } from '@tegonhq/ui';
import { Shortcut } from 'common/shortcut';
import { useApplication } from 'hooks/application';
import { Check, Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { DialogType } from 'modules/dialog-views-provider';
import { useTaskOperations } from 'modules/search/command/use-task-operations';
import React from 'react';

interface ActionBarProps {
  openDialog: (dialogType: DialogType, taskIds: string[]) => void;
}

export const ActionBar = observer(({ openDialog }: ActionBarProps) => {
  const { selectedTasks } = useApplication();
  const { markComplete } = useTaskOperations();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 shadow-1 rounded-lg bg-background p-2">
      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => {
            openDialog(DialogType.SCHEDULE, selectedTasks);
          }}
        >
          <Clock size={16} />
          <Shortcut shortcut="S" className="ml-1" />
        </Button>

        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => {
            openDialog(DialogType.DUEDATE, selectedTasks);
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
      </div>
    </div>
  );
});
