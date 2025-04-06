import {
  AI,
  Button,
  Close,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ConversationHeaderActions } from 'modules/conversation';

interface RightSideHeaderProps {
  onClose: () => void;
}

export const RightSideHeader = observer(({ onClose }: RightSideHeaderProps) => {
  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
      <div className="flex items-center justify-between gap-2 px-2 w-full">
        <div className="flex gap-1 items-center">
          <div className="flex gap-2 items-center">
            <Tabs
              defaultValue="chat"
              value="chat"
              onValueChange={() => {}}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full h-7 text-xs">
                <TabsTrigger value="chat" className="h-5">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="agent" className="h-5">
                  Agent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <ConversationHeaderActions />
      </div>
    </header>
  );
});
