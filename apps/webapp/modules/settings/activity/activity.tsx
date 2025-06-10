import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@redplanethq/ui';
import React from 'react';

import { InboxConversation } from 'modules/inbox/inbox-conversation';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { ActivityList } from './activity-list';

export const Activities = () => {
  const [selected, setSelected] = React.useState<
    { type: string; id: string } | undefined
  >(undefined);
  const { isLoading } = useGetIntegrationDefinitions();

  const getConversationId = () => {
    if (selected && selected.type === 'conversation') {
      return selected.id;
    }

    return undefined;
  };

  if (isLoading) {
    return null;
  }

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
        className="flex flex-col w-full h-[calc(100vh_-_10px)]"
      >
        {selected && (
          <InboxConversation conversationId={getConversationId()} inLogs />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
