import { Button, Input } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { SCOPES } from 'common/shortcut-scopes';

import { useCreateTaskMutation } from 'services/tasks';

export const AddTask = observer(() => {
  const inputRef = useRef(null);
  const { mutate: addTaskMutation, isLoading } = useCreateTaskMutation({
    onSuccess: () => {
      inputRef.current.value = '';
    },
  });

  const addTask = (title: string) => {
    addTaskMutation({
      title,
      status: 'Todo',
    });
  };

  useHotkeys(
    ['n'],
    (e) => {
      e.preventDefault();
      inputRef.current.focus();
    },
    {
      scopes: [SCOPES.QUICK],
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputKeyDown = (e: any) => {
    const title = inputRef.current?.value;
    if (!title) {
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      addTask(title);
    }
  };

  return (
    <div className="flex px-4 items-center">
      <Input
        ref={inputRef}
        placeholder="Check my emails everyday at 9"
        className="rounded-r-none pr-1"
        onKeyDown={handleInputKeyDown}
      />
      <Button
        variant="secondary"
        isLoading={isLoading}
        size="lg"
        className="rounded-l-none pl-0 text-sm"
      >
        Add task
      </Button>
    </div>
  );
});
