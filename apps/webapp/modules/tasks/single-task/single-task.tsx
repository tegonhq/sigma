import { ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useApplication } from 'hooks/application';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { SingleTaskEditor } from './single-task-editor';
import { SingleTaskMetadata } from './single-task-metadata';
import { PageTitle } from './single-task-title';
import { Header } from '../header';

interface SingleTaskProps {
  index?: number;
  taskId: string;
  sideView?: boolean;
}

export const SingleTaskWithoutLayout = observer(
  ({ taskId, sideView = false }: SingleTaskProps) => {
    const { tasksStore, pagesStore } = useContextStore();
    const task = tasksStore.getTaskWithId(taskId);
    const page = pagesStore.getPageWithId(task?.pageId);
    const { back } = useRouter();
    const { mutate: updateTask } = useUpdateTaskMutation({});

    useHotkeys(
      [Key.Escape],
      () => {
        back();
      },
      {
        scopes: [SCOPES.Task],
        enabled: !sideView,
      },
    );

    const onChange = (title: string) => {
      updateTask({
        taskId: task.id,
        title,
      });
    };

    if (!task || !page) {
      return null;
    }

    return (
      <ScrollArea className="w-full h-full flex justify-center p-4">
        <div className="flex h-full justify-center w-full">
          <div className="grow flex flex-col gap-2 h-full max-w-[97ch]">
            <div>
              <PageTitle value={page.title} onChange={onChange} />
            </div>

            <SingleTaskMetadata task={task} />

            <div className="flex flex-col gap-0 pt-3">
              <SingleTaskEditor page={page} task={task} />
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  },
);

export const SingleTask = observer(
  ({ taskId, sideView = false }: SingleTaskProps) => {
    return (
      <RightSideLayout header={<Header />}>
        <SingleTaskWithoutLayout taskId={taskId} sideView={sideView} />
      </RightSideLayout>
    );
  },
);
