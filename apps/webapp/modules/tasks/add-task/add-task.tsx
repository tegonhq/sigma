import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { AdjustableTextArea } from 'common/adjustable-textarea';
import { Shortcut } from 'common/shortcut';
import { SCOPES } from 'common/shortcut-scopes';

import { useCreateTaskMutation } from 'services/tasks';

import { NewTaskSchema } from './add-task-type';

interface AddTaskProps {
  onCancel: () => void;
}

export const AddTask = observer(({ onCancel }: AddTaskProps) => {
  // The form has a array of issues where first issue is the parent and the later sub issues
  const form = useForm<z.infer<typeof NewTaskSchema>>({
    resolver: zodResolver(NewTaskSchema),
    defaultValues: {
      status: 'Todo',
    },
  });

  const { mutate: addTaskMutation } = useCreateTaskMutation({
    onSuccess: () => {
      onCancel();
    },
  });

  const addTask = (data: z.infer<typeof NewTaskSchema>) => {
    addTaskMutation({
      title: data.title,
      status: data.status,
      listId: data.listId,
    });
  };

  useHotkeys(
    [`${Key.Enter}`],
    () => {
      form.handleSubmit(addTask)();
    },
    {
      scopes: [SCOPES.Global],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="flex flex-col p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(addTask)}>
          <div className="font-normal w-full flex items-center">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grow overflow-hidden">
                  <FormControl>
                    <div className="flex items-center gap-1">
                      <AdjustableTextArea
                        {...field}
                        placeholder="Check my emails everyday at 9 in the morning"
                        autoFocus
                        className="bg-transparent text-md"
                        placeholderClassName="text-md"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end mt-3 items-end text-sm gap-2">
            <Button variant="secondary" className="items-center" type="submit">
              Create task
              <Shortcut shortcut="Enter" className="ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});
