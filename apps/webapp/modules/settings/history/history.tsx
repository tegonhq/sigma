import {
  Button,
  Card,
  CardContent,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@redplanethq/ui';
import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { InboxConversation } from 'modules/inbox/inbox-conversation';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

import { ActivityList } from './activity-list';

export const History = observer(() => {
  const [selected, setSelected] = React.useState<
    { type: string; id: string } | undefined
  >(undefined);
  const { isLoading } = useGetIntegrationDefinitions();
  const { activitiesStore } = useContextStore();
  const [copied, setCopied] = React.useState(false);

  const getConversationId = () => {
    if (selected && selected.type === 'conversation') {
      return selected.id;
    }

    return undefined;
  };

  if (isLoading) {
    return null;
  }
  const getRightSideComponent = () => {
    if (selected && selected.type === 'activity') {
      const activity = activitiesStore.getActivityById(selected.id);

      const handleCopy = () => {
        copy(activity.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div className="relative flex flex-col h-full justify-center w-full items-center overflow-auto px-2">
          <div className="flex flex-col justify-center items-center overflow-hidden h-full w-full mt-2">
            <p className="w-full text-start max-w-[400px] mb-1 text-md">
              Activity
            </p>
            <p className="w-full text-start max-w-[400px] mb-1 text-muted-foreground">
              I haven&apos;t found anything in memory that can help you with
              this activity.
            </p>
            <Card className="max-w-[400px] p-3">
              <CardContent>
                <div>{activity.text}</div>
              </CardContent>
            </Card>
            <div className="flex justify-end mt-2 w-full max-w-[400px]">
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return <InboxConversation conversationId={getConversationId()} />;
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        maxSize={50}
        defaultSize={16}
        minSize={16}
        collapsible
        collapsedSize={16}
        className="h-[calc(100vh_-_10px)] min-w-[200px] border-r-1 border-border"
      >
        <ActivityList selected={selected} setSelected={setSelected} />
      </ResizablePanel>
      <ResizableHandle className="w-1" />

      <ResizablePanel
        collapsible
        collapsedSize={0}
        className="flex flex-col w-full h-[calc(100vh_-_24px)]"
      >
        {selected && getRightSideComponent()}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
});
