import { Loader } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import getConfig from 'next/config';
import * as React from 'react';
import { Socket, io } from 'socket.io-client';

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
      activityStore,
      conversationsStore,
      conversationHistoryStore,
    } = useContextStore();
    const user = React.useContext(UserContext);

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
      const socket = io(publicRuntimeConfig.NEXT_PUBLIC_BACKEND_HOST, {
        query: {
          workspaceId: workspaceStore.workspace.id,
          userId: user.id,
        },
        withCredentials: true,
      });
      setSocket(socket);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const MODEL_STORE_MAP = {
        [MODELS.Workspace]: workspaceStore,
        [MODELS.IntegrationAccount]: integrationAccountsStore,

        [MODELS.Page]: pagesStore,
        [MODELS.Task]: tasksStore,
        [MODELS.Activity]: activityStore,
        [MODELS.Conversation]: conversationsStore,
        [MODELS.ConversationHistory]: conversationHistoryStore,
      };

      socket.on('message', async (newMessage: string) => {
        await saveSocketData([JSON.parse(newMessage)], MODEL_STORE_MAP);
      });
    }

    if (workspaceStore?.workspace) {
      return <>{children}</>;
    }

    return <Loader height={500} text="Setting up realtime" />;
  },
);
