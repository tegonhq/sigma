import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useRemoteComponent } from 'common/RemoteComponent';
import type { PageType, TaskType } from 'common/types';

import { useIntegrationFromAccount } from 'hooks/integration';
import { useIPC } from 'hooks/ipc';

import { SingleTaskEditor } from './single-task-editor';
import { getIntegrationURL } from '../utils';

interface SingleTaskIntegrationProps {
  task: TaskType;
  page: PageType;
  onBack: () => void;
}

export const SingleTaskIntegration = observer(
  ({ task, page, onBack }: SingleTaskIntegrationProps) => {
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
      const url = await getIntegrationURL(
        ipc,
        integration.name,
        integration.version,
      );

      setUrl(url);
    };

    if (loading || isLoading) {
      return <div>Loading...</div>;
    }

    if (err) {
      return <div>Unknown Error: {err.toString()}</div>;
    }

    return (
      <div className="flex flex-col overflow-hidden h-full">
        <div className="flex gap-2 items-center p-4 pb-3">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <span className="inline-block">Tasks</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <div className="inline-flex items-center gap-1 min-w-[0px]">
                  <div className="truncate"> {page.title}</div>
                </div>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

        <Component
          task={task}
          page={page}
          pageNode={<SingleTaskEditor page={page} autoFocus />}
        />
      </div>
    );
  },
);
