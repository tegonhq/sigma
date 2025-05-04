import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import ReactTimeAgo from 'react-time-ago';

import { getIcon, type IconType } from 'common/icon-utils';
import { type NotificationType } from 'common/types';

import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

interface InboxItemProps {
  notification: NotificationType;
  selected: boolean;
  onSelect: (id: string) => void;
  nextIsSelected: boolean;
}

function getNotificationText(): string {
  return 'New activity';
}

export const InboxItem = observer(
  ({ notification, selected, onSelect, nextIsSelected }: InboxItemProps) => {
    const { activitesStore, integrationAccountsStore } = useContextStore();

    const activity = activitesStore.getActivityById(notification.modelId);
    const { data: integrationDefinitions } = useGetIntegrationDefinitions();

    const integrationAccount = integrationAccountsStore.getAccountWithId(
      activity?.integrationAccountId,
    );

    console.log(integrationAccount);

    const integrationDefinition =
      integrationDefinitions &&
      integrationDefinitions.find(
        (integrationDefinition) =>
          integrationDefinition.id ===
          integrationAccount?.integrationDefinitionId,
      );

    const Icon = integrationDefinition
      ? getIcon(integrationDefinition.icon as IconType)
      : undefined;

    // TODO : will fail when issues are from different teams
    const noBorder = nextIsSelected || selected;

    return (
      <div
        className={cn(
          'ml-2 p-3 py-0 mr-2 mb-1 flex gap-1 items-center hover:bg-grayAlpha-100 rounded',
          selected && 'bg-grayAlpha-200',
        )}
        onClick={() => {
          if (!notification.read) {
          }

          onSelect(notification.id);
        }}
      >
        <div
          className={cn(
            'flex flex-col gap-1 py-2 w-full',
            !noBorder && 'border-b border-border',
          )}
        >
          <div className="flex justify-between w-full items-center">
            <div
              className={cn(
                'w-[calc(100%_-_40px)]',
                notification.read ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              <div className="truncate"> {activity?.text} </div>
            </div>
            <div className="text-foreground text-right">
              {Icon && <Icon size={18} className="dark:text-background" />}
            </div>
          </div>

          <div className="flex justify-between text-xs">
            <div className="flex gap-2 text-muted-foreground">
              {getNotificationText()}
            </div>

            <div className="text-muted-foreground">
              <ReactTimeAgo
                date={new Date(notification.updatedAt)}
                timeStyle="twitter"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
