import { ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useRemoteComponent } from 'common/RemoteComponent';
import type { PageType, TaskType } from 'common/types';
import { RightSideLayout } from 'layouts/right-side-layout';

import { useIntegrationFromAccount } from 'hooks/integration';
import { useIPC } from 'hooks/ipc';

import { SingleTaskEditor } from './single-task-editor';
import { Header } from '../header';
import { getIntegrationURL } from '../utils';

interface SingleTaskIntegrationProps {
  task: TaskType;
  page: PageType;
  onBack: () => void;
}

export const SingleTaskIntegration = observer(
  ({ task, page }: SingleTaskIntegrationProps) => {
    const ipc = useIPC();
    const [url, setUrl] = React.useState(undefined);
    const { isLoading, integration } = useIntegrationFromAccount(
      task.integrationAccountId,
    );
    const [loading, err, Component] = useRemoteComponent(url, 'TaskView');

    React.useEffect(() => {
      if (integration) {
        getUrl();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integration]);

    const getUrl = async () => {
      const url = await getIntegrationURL(ipc, integration);

      setUrl(url);
    };

    if (loading || isLoading) {
      return null;
    }

    if (err) {
      return <div>Unknown Error: {err.toString()}</div>;
    }

    return (
      <RightSideLayout header={<Header />}>
        <ScrollArea className="w-full h-full flex justify-center p-4">
          <div className="flex h-full justify-center w-full">
            <div className="grow flex flex-col gap-2 h-full max-w-[97ch]">
              <Component
                task={task}
                page={page}
                pageNode={
                  <SingleTaskEditor task={task} page={page} autoFocus />
                }
              />
            </div>
          </div>
        </ScrollArea>
      </RightSideLayout>
    );
  },
);
