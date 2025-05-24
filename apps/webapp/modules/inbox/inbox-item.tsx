import { cn } from '@tegonhq/ui';
import { RefreshCcw } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { getIcon, type IconType } from 'common/icon-utils';

import { useGetConversationSyncsRun } from 'services/conversations';
import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

interface InboxItemProps {
  conversationId: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const InboxItem = observer(
  ({ conversationId, selected, onSelect }: InboxItemProps) => {
    const { conversationsStore, activitesStore, integrationAccountsStore } =
      useContextStore();
    const { data: syncs } = useGetConversationSyncsRun(conversationId);

    const conversationData =
      conversationsStore.getConversationWithId(conversationId);
    const { data: integrationDefinitions } = useGetIntegrationDefinitions();
    const activity = activitesStore.getActivityById(
      conversationData?.activityId,
    );
    const integrationAccount = integrationAccountsStore.getAccountWithId(
      activity?.integrationAccountId,
    );

    const integrationDefinition =
      integrationDefinitions &&
      integrationDefinitions.find(
        (integrationDefinition) =>
          integrationDefinition.id ===
          integrationAccount?.integrationDefinitionId,
      );

    const getIconComponent = () => {
      if (syncs && syncs.length > 0) {
        return RefreshCcw;
      }

      const Icon = integrationDefinition
        ? getIcon(integrationDefinition.icon as IconType)
        : null;

      return Icon;
    };

    const Icon = getIconComponent();

    return (
      <div
        className={cn(
          'mx-2 py-0 px-2 mb-0.5 flex gap-1 items-center hover:bg-grayAlpha-100 rounded',
          selected && 'bg-grayAlpha-200',
        )}
        onClick={() => {
          if (!conversationData.unread) {
          }

          onSelect(conversationData.id);
        }}
      >
        <div className={cn('flex flex-col gap-1 py-1.5 w-full')}>
          <div className="flex gap-2 w-full items-center">
            <div
              className={cn(
                activity ? 'w-[calc(100%_-_25px)]' : 'w-[calc(100%_-_10px)]',
              )}
            >
              <div className="truncate"> {conversationData?.title} </div>
            </div>

            <div className="text-foreground text-right">
              {Icon && <Icon size={16} className="dark:text-background" />}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
