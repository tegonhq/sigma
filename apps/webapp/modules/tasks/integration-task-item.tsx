import { observer } from "mobx-react-lite";
import React from "react";

import { useRemoteComponent } from "common/RemoteComponent";
import type { PageType, TaskType } from "common/types";

import { useIntegrationFromAccount } from "hooks/integration";
import { useIPC } from "hooks/ipc";

import { getIntegrationURL } from "./utils";

interface IntegrationTaskItemProps {
  task: TaskType;
  page: PageType;
  statusChange: (status: string) => void;
}

export const IntegrationTaskItem = observer(
  ({ task, page }: IntegrationTaskItemProps) => {
    const ipc = useIPC();
    const [url, setUrl] = React.useState(undefined);
    const { isLoading, integration } = useIntegrationFromAccount(
      task.integrationAccountId
    );
    const [loading, err, Component] = useRemoteComponent(url, "TaskItem");

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
        integration.version
      );

      setUrl(url);
    };

    if (loading || isLoading) {
      return <div>Loading...</div>;
    }

    if (err) {
      return <div>Unknown Error: {err.toString()}</div>;
    }

    return <Component task={task} page={page} />;
  }
);
