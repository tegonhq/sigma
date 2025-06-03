import { Loader } from '@redplanethq/ui';
import * as React from 'react';

import { hash } from 'common/common-utils';
import type { BootstrapResponse } from 'common/types';

import { useWorkspace } from 'hooks/workspace';

import { useBootstrapRecords, useDeltaRecords } from 'services/sync';

import { useContextStore } from 'store/global-context-provider';
import { MODELS } from 'store/models';
import { UserContext } from 'store/user-context';

import { saveSocketData } from './socket-data-util';

interface Props {
  children: React.ReactElement;
}

export function BootstrapWrapper({ children }: Props) {
  const workspace = useWorkspace();
  const user = React.useContext(UserContext);
  const [loading, setLoading] = React.useState(true);
  const hashKey = `${workspace?.id}__${user.id}`;
  const lastSequenceId =
    localStorage && localStorage.getItem(`lastSequenceId_${hash(hashKey)}`);
  const {
    workspaceStore,
    integrationAccountsStore,
    pagesStore,
    tasksStore,
    conversationsStore,
    conversationHistoryStore,
    listsStore,
    taskOccurrencesStore,
    agentWorklogsStore,
    activitesStore,
    automationsStore,
  } = useContextStore();

  const MODEL_STORE_MAP = {
    [MODELS.Workspace]: workspaceStore,
    [MODELS.IntegrationAccount]: integrationAccountsStore,
    [MODELS.Task]: tasksStore,
    [MODELS.Page]: pagesStore,
    [MODELS.Conversation]: conversationsStore,
    [MODELS.ConversationHistory]: conversationHistoryStore,
    [MODELS.List]: listsStore,
    [MODELS.TaskOccurrence]: taskOccurrencesStore,
    [MODELS.AgentWorklog]: agentWorklogsStore,
    [MODELS.Activity]: activitesStore,
    [MODELS.Automation]: automationsStore,
  };

  React.useEffect(() => {
    if (workspace) {
      initStore();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { refetch: bootsrapRecord } = useBootstrapRecords({
    modelNames: Object.values(MODELS),
    workspaceId: workspace?.id,
    userId: user.id,
    onSuccess: async (data: BootstrapResponse) => {
      await saveSocketData(data.syncActions, MODEL_STORE_MAP);
      localStorage.setItem(
        `lastSequenceId_${hash(hashKey)}`,
        `${data.lastSequenceId}`,
      );
    },
  });

  const { refetch: syncRecords } = useDeltaRecords({
    modelNames: Object.values(MODELS),
    workspaceId: workspace?.id,
    lastSequenceId,
    userId: user.id,
    onSuccess: async (data: BootstrapResponse) => {
      await saveSocketData(data.syncActions, MODEL_STORE_MAP);
      localStorage.setItem(
        `lastSequenceId_${hash(hashKey)}`,
        `${data.lastSequenceId}`,
      );
    },
  });

  const initStore = async () => {
    if (lastSequenceId) {
      setLoading(false);
      await syncRecords();
    } else {
      await bootsrapRecord();
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Syncing data..." />;
  }

  return <>{children}</>;
}
