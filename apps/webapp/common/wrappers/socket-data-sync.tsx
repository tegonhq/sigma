import { Loader } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import getConfig from 'next/config';
import * as React from 'react';
import { Socket, io } from 'socket.io-client';

import { hash } from 'common/common-utils';

import { useContextStore } from 'store/global-context-provider';
import { MODELS } from 'store/models';
import { UserContext } from 'store/user-context';

import { saveSocketData } from './socket-data-util';

interface Props {
  children: React.ReactElement;
}

const { publicRuntimeConfig } = getConfig();

// This wrapper ensures the data received from the socket is passed to indexed DB
export const SocketDataSyncWrapper: React.FC<Props> = observer(
  (props: Props) => {
    const { children } = props;

    const {
      workspaceStore,
      integrationAccountsStore,
      pagesStore,
      tasksStore,
      taskOccurrencesStore,
      conversationsStore,
      conversationHistoryStore,
      listsStore,
      taskExternalLinksStore,
      agentWorklogsStore,
      activitesStore,
      notificationsStore,
    } = useContextStore();
    const user = React.useContext(UserContext);
    const hashKey = user.id;

    const [socket, setSocket] = React.useState<Socket | undefined>(undefined);

    React.useEffect(() => {
      if (!socket) {
        initSocket();
      }

      return () => {
        socket && socket.disconnect();
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function initSocket() {
      const socket = io(publicRuntimeConfig.NEXT_PUBLIC_BASE_HOST, {
        path: '/api/socket.io',
        query: {
          workspaceId: user.workspace.id,
          userId: user.id,
        },
        withCredentials: true,

        // Add reconnection
      });
      setSocket(socket);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const MODEL_STORE_MAP = {
        [MODELS.Workspace]: workspaceStore,
        [MODELS.IntegrationAccount]: integrationAccountsStore,
        [MODELS.Page]: pagesStore,
        [MODELS.Task]: tasksStore,
        [MODELS.TaskOccurrence]: taskOccurrencesStore,
        [MODELS.Conversation]: conversationsStore,
        [MODELS.ConversationHistory]: conversationHistoryStore,
        [MODELS.List]: listsStore,
        [MODELS.TaskExternalLink]: taskExternalLinksStore,
        [MODELS.AgentWorklog]: agentWorklogsStore,
        [MODELS.Notification]: notificationsStore,
        [MODELS.Activity]: activitesStore,
      };

      socket.on('message', async (newMessage: string) => {
        const data = JSON.parse(newMessage);

        await saveSocketData([data], MODEL_STORE_MAP);
        localStorage.setItem(
          `lastSequenceId_${hash(hashKey)}`,
          `${data.sequenceId}`,
        );
      });

      // Add connection event handlers
      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      });

      socket.on('reconnect_error', (error) => {
        console.log('Socket reconnection error:', error);
      });
    }

    if (workspaceStore?.workspace) {
      return <>{children}</>;
    }

    return <Loader height={500} text="Setting up realtime" />;
  },
);
