import { Button, cn, Input } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useCreateTaskMutation } from 'services/tasks';

import { StatusDropdown, StatusDropdownVariant } from './status-dropdown';

interface AddTaskProps {
  onCancel: () => void;
}

export const AddTask = observer(({ onCancel }: AddTaskProps) => {
  const [status, setStatus] = React.useState('Todo');
  const [value, setValue] = React.useState('');

  const { mutate: addTaskMutation } = useCreateTaskMutation({
    onSuccess: () => {
      onCancel();
    },
  });

  const addTask = () => {
    addTaskMutation({
      status,
      title: value,
    });
  };

  useHotkeys(
    [Key.Enter],
    () => {
      addTask();
    },
    {
      scopes: [SCOPES.Task],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="pl-1 flex group cursor-default gap-2">
      <div className="w-full flex items-center">
        <div
          className={cn(
            'flex grow items-start gap-2 pl-2 ml-1 pr-2 rounded-xl shrink min-w-[0px]',
          )}
        >
          <div className="pt-2.5 shrink-0">
            <StatusDropdown
              value={status}
              onChange={(status) => setStatus(status)}
              variant={StatusDropdownVariant.NO_BACKGROUND}
            />
          </div>

          <div
            className={cn(
              'flex flex-col w-full py-2.5 border-b border-border shrink min-w-[0px]',
            )}
          >
            <div className="flex w-full">
              <Input
                className="w-full bg-transparent p-0 h-6 flex-1"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
              />

              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button variant="secondary" size="sm" onClick={addTask}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
