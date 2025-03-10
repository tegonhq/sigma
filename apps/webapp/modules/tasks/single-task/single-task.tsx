import { ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import { AILayout } from 'layouts/ai-layout';

import { useApplication } from 'hooks/application';

import { useUpdatePageMutation } from 'services/pages';

import { useContextStore } from 'store/global-context-provider';

import { SingleTaskEditor } from './single-task-editor';
import { SingleTaskIntegration } from './single-task-integration';
import { SingleTaskMetadata } from './single-task-metadata';
import { PageTitle } from './single-task-title';
import { Header } from '../header';

interface SingleTaskProps {
  index?: number;
  taskId: string;
  sideView?: boolean;
}

export const SingleTask = observer(
  ({ taskId, sideView = false }: SingleTaskProps) => {
    const { tasksStore, pagesStore } = useContextStore();
    const { addToSelectedTask, removeSelectedTask } = useApplication();
    const task = tasksStore.getTaskWithId(taskId);
    const page = pagesStore.getPageWithId(task?.pageId);
    const { back } = useRouter();
    const { mutate: updatePage } = useUpdatePageMutation({});

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

    React.useEffect(() => {
      if (task) {
        addToSelectedTask(task.id, true);
      }

      return () => {
        removeSelectedTask(task?.id);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task]);

    const onChange = (title: string) => {
      updatePage({
        pageId: page.id,
        title,
      });
    };

    if (!task || !page) {
      return null;
    }

    if (task.integrationAccountId) {
      return <SingleTaskIntegration task={task} page={page} onBack={back} />;
    }

    return (
      <AILayout header={<Header />}>
        <ScrollArea className="w-full h-full flex justify-center p-4">
          <div className="flex h-full justify-center w-full">
            <div className="grow flex flex-col gap-2 h-full max-w-[97ch]">
              <div>
                <PageTitle value={page.title} onChange={onChange} />
              </div>

              <SingleTaskMetadata task={task} />

              <div className="flex flex-col gap-0 pt-3">
                <SingleTaskEditor page={page} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </AILayout>
    );
  },
);
