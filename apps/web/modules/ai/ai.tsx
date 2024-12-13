import { AddLine, AI as AIIcon, Button } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useContextStore } from 'store/global-context-provider';

import { Conversation } from './conversation';
import { AIHistoryDropdown } from './history-dropdown';

export const AI = observer(() => {
  const { commonStore } = useContextStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center gap-2 p-6 font-mono">
        <div className="flex gap-2">
          <AIIcon />
          Sigma AI
        </div>

        <div className="flex gap-1 items-center">
          <Button
            variant="ghost"
            onClick={() => {
              commonStore.update({ currentConversationId: undefined });
            }}
          >
            <AddLine size={16} />
          </Button>

          <AIHistoryDropdown />
        </div>
      </div>

      <div className="grow overflow-hidden">
        <Conversation />
      </div>
    </div>
  );
});
