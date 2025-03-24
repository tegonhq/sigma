import { cn, ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

import { SingleTaskEditor } from './single-task-editor';
import { SingleTaskMetadata } from './single-task-metadata';
import { PageTitle } from './single-task-title';
import { Header } from '../header';
import { SingleTaskStatus } from './single-task-status';
import { useScope } from 'hooks/use-scope';
import { sort } from 'fast-sort';

interface SingleTaskProps {
  index?: number;
  taskId: string;
  sideView?: boolean;
}

export const SingleTaskWithoutLayout = observer(
  ({ taskId, sideView = false }: SingleTaskProps) => {
    useScope(SCOPES.Task);
    const { tasksStore, pagesStore, taskOccurrencesStore } = useContextStore();
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

    const getStatus = () => {
      // Get yesterday's end of day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const taskOccurrences = taskOccurrencesStore.getTaskOccurrencesForTask(
        task.id,
      );

      // Filter and sort occurrences after yesterday
      const sortedOccurrences = sort(
        taskOccurrences.filter((occ) => new Date(occ.startTime) > yesterday),
      ).by([{ asc: (u) => u.startTime }]);

      const recentTaskOccurrence = sortedOccurrences[0];

      if (task && task.recurrence.length > 0 && recentTaskOccurrence) {
        return recentTaskOccurrence?.status;
      }

      return task.status;
    };

    if (!task || !page) {
      return null;
    }

    return (
      <ScrollArea className="w-full h-full flex justify-center">
        <div className="flex h-full justify-center w-full">
          <div className="grow flex flex-col gap-2 h-full max-w-[97ch]">
            <div className="px-4 pt-4 flex gap-2 items-start">
              <SingleTaskStatus task={task} />
              <PageTitle
                value={page.title}
                onChange={onChange}
                className={cn(
                  getStatus() === 'Done' &&
                    'line-through opacity-60 decoration-[1px]',
                )}
              />
            </div>

            <SingleTaskMetadata task={task} />

            <div className="flex flex-col gap-0 pt-3 px-4">
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
