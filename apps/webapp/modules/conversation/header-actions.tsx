import { AddLine, Button } from '@tegonhq/ui';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useContextStore } from 'store/global-context-provider';

import { AIHistoryDropdown } from './history-dropdown';

export const ConversationHeaderActions = () => {
  const { commonStore } = useContextStore();

  useHotkeys(
    [`${Key.Meta}+${Key.Shift}+n`],
    () => {
      commonStore.update({ currentConversationId: undefined });
    },
    {
      scopes: [SCOPES.AI],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="flex items-center">
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
  );
};
