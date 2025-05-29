import { observer } from 'mobx-react-lite';

import { useConversationRows } from './use-conversation-rows';
import { Button } from '@tegonhq/ui';
import { useApplication } from 'hooks/application';
import { useContextStore } from 'store/global-context-provider';
import { InboxItem } from './inbox-item';

export const ConversationsView = observer(() => {
  const rows = useConversationRows('all');
  const { updateConversationId } = useApplication();

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col mt-10">
      <h3 className="text-muted-foreground mb-1"> Conversations </h3>

      <div className="flex flex-col gap-1">
        {rows.map((row, index) => {
          return (
            <InboxItem
              conversationId={row.id}
              selected={false}
              onSelect={(id) => updateConversationId(id)}
            />
          );
        })}
      </div>
    </div>
  );
});
