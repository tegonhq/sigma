import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  IssuesLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { AdjustableTextArea } from 'common/adjustable-textarea';
import { Shortcut } from 'common/shortcut';
import { SCOPES } from 'common/shortcut-scopes';
import type { ListType } from 'common/types';

import { useApplication } from 'hooks/application';

import { useCreateListMutation } from 'services/lists/create-list';
import { useCreateTaskMutation } from 'services/tasks';

import { TabViewType } from 'store/application';

import { StatusDropdown, StatusDropdownVariant } from '../status-dropdown';
import { NewTaskSchema } from './add-task-type';
import { ListDropdown, ListDropdownVariant } from '../list-dropdown';

interface AddTaskProps {
  onCancel: () => void;
}

export const AddTask = observer(({ onCancel }: AddTaskProps) => {
  const { tabs } = useApplication();

  // The form has a array of issues where first issue is the parent and the later sub issues
  const form = useForm<z.infer<typeof NewTaskSchema>>({
    resolver: zodResolver(NewTaskSchema),
    defaultValues: {
      status: tabs[0].type === TabViewType.MY_DAY ? 'In Progress' : 'Todo',
    },
  });

  const { mutate: addTaskMutation } = useCreateTaskMutation({
    onSuccess: () => {
      onCancel();
    },
  });

  const { mutate: createList } = useCreateListMutation({});

  const addTask = (data: z.infer<typeof NewTaskSchema>) => {
    if (data.listId && data.listId.includes('__new')) {
      createList(
        {
          name: data.listId.replace('__new', ''),
        },
        {
          onSuccess: (list: ListType) => {
            addTaskMutation({
              title: data.title,
              status: data.status,
              listId: list.id,
            });
          },
        },
      );

      return;
    }

    addTaskMutation({
      title: data.title,
      status: data.status,
      listId: data.listId,
    });
  };

  useHotkeys(
    [`${Key.Meta}+${Key.Enter}`],
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
                        placeholder="Check my emails everyday at 9 in the morning"
                        autoFocus
                        className="bg-transparent text-md px-2"
                        placeholderClassName="pl-2 text-md"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between mt-3 items-end text-sm gap-4">
            <div className="flex gap-1 grow flex-wrap">
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
                  </FormItem>
                )}
              />
            </div>
            <Button variant="secondary" className="items-center" type="submit">
              Create task
              <Shortcut shortcut="Cmd + Enter" className="ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});
