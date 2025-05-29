import { AddLine, Button } from '@tegonhq/ui';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { AIHistoryDropdown } from './history-dropdown';

export const ConversationHeaderActions = () => {
  const { updateConversationId } = useApplication();

  useHotkeys(
    [`${Key.Meta}+${Key.Shift}+n`],
    () => {
      updateConversationId(undefined);
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
          updateConversationId(undefined);
        }}
      >
        <AddLine size={16} />
      </Button>
      <AIHistoryDropdown />
    </div>
  );
};
