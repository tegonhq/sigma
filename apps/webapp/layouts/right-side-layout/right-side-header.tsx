import { Button, Close } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ConversationHeaderActions } from 'modules/conversation';

interface RightSideHeaderProps {
  onClose: () => void;
}

export const RightSideHeader = observer(({ onClose }: RightSideHeaderProps) => {
  return (
    <header className="flex h-[40px] shrink-0 items-center justify-between gap-2">
      <div className="flex items-center justify-end gap-2 px-2 w-full">
        <div className="flex gap-1 items-center">
          <ConversationHeaderActions />
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            <Close size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
});
