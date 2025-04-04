import { AI, Button, Close } from '@tegonhq/ui';
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
          <Button size="sm" variant="ghost" onClick={onClose}>
            <Close size={14} />
          </Button>

          <div className="flex gap-2 items-center">Sigma AI</div>
        </div>

        <ConversationHeaderActions />
      </div>
    </header>
  );
});
