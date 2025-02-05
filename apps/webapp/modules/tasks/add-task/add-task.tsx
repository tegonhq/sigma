import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  IssuesLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { AdjustableTextArea } from 'common/adjustable-textarea';
import { SCOPES } from 'common/shortcut-scopes';

import { useCreateTaskMutation } from 'services/tasks';

import { StatusDropdown, StatusDropdownVariant } from '../status-dropdown';
import { NewTaskSchema } from './add-task-type';
import { ListDropdown, ListDropdownVariant } from '../list-dropdown';
import { Shortcut } from 'common/shortcut';

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

  const addTask = () => {};

  useHotkeys(
    [Key.Enter],
    (event) => {
      switch (event.key) {
        case Key.Enter:
          addTask();
          break;
      }
    },
    {
      scopes: [SCOPES.Task],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="flex flex-col p-3">
      <Form {...form}>
        <form>
          <div className="font-normal w-full flex items-center">
            <IssuesLine size={18} className="shrink-0" />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grow overflow-hidden">
                  <FormControl>
                    <div className="flex items-center gap-1">
                      <AdjustableTextArea
                        {...field}
                        placeholder="New task"
                        autoFocus
                        className="bg-transparent text-md px-2"
                        placeholderClassName="pl-2 text-md"
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between mt-3 items-end">
            <div className="flex gap-1 grow">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StatusDropdown
                        variant={StatusDropdownVariant.DEFAULT}
                        onChange={(status: string) => field.onChange(status)}
                        value={field.value}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ListDropdown
                        variant={ListDropdownVariant.DEFAULT}
                        onChange={(listId: string) => field.onChange(listId)}
                        value={field.value}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button variant="secondary" className="items-center">
              Create task
              <Shortcut shortcut="Enter" className="ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});
