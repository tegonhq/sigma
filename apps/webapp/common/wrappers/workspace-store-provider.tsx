import { Loader } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useWorkspace } from 'hooks/workspace';

import { useContextStore } from 'store/global-context-provider';

export const WorkspaceStoreInit = observer(
  ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = React.useState(true);
    const {
      workspaceStore,
      integrationAccountsStore,
      tasksStore,
      pagesStore,
      applicationStore,
      conversationsStore,
      conversationHistoryStore,
      listsStore,
      taskOccurrencesStore,
      agentWorklogsStore,
      activitiesStore,
      automationsStore,
    } = useContextStore();

    const currentWorkspace = useWorkspace();

    React.useEffect(() => {
      if (currentWorkspace) {
        // Setting this to help upload the images to this workspace
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).workspaceId = currentWorkspace.id;
        initWorkspaceBasedStores();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWorkspace]);

    // All data related to workspace
    const initWorkspaceBasedStores = React.useCallback(async () => {
      setLoading(true);

      await applicationStore.load();
      await workspaceStore.load(currentWorkspace.id);
      await pagesStore.load();
      await integrationAccountsStore.load();

      setLoading(false);

      await Promise.all([
        tasksStore.load(),
        pagesStore.load(),
        conversationsStore.load(),
        conversationHistoryStore.load(),
        listsStore.load(),
        taskOccurrencesStore.load(),
        agentWorklogsStore.load(),
        activitiesStore.load(),
        automationsStore.load(),
      ]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWorkspace.id]);

    if (loading) {
      return <Loader text="Loading workspace" />;
    }

    return <>{children}</>;
  },
);
