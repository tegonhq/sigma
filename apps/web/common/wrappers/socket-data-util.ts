import type { SyncActionRecord } from 'common/types';

import { saveIntegrationAccountData } from 'store/integration-accounts';
import { saveLabelData } from 'store/labels';
import { MODELS } from 'store/models';
import { savePageData } from 'store/pages';
import { saveStatusData } from 'store/status';
import { saveWorkspaceData } from 'store/workspace';

// Saves the data from the socket and call explicitly functions from individual models
export async function saveSocketData(
  data: SyncActionRecord[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MODEL_STORE_MAP: Record<string, any>,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      switch (record.modelName) {
        case MODELS.Label: {
          return await saveLabelData([record], MODEL_STORE_MAP[MODELS.Label]);
        }

        case MODELS.Workspace: {
          return await saveWorkspaceData(
            [record],
            MODEL_STORE_MAP[MODELS.Workspace],
          );
        }

        case MODELS.IntegrationAccount: {
          return await saveIntegrationAccountData(
            [record],
            MODEL_STORE_MAP[MODELS.IntegrationAccount],
          );
        }

        case MODELS.Page: {
          return await savePageData([record], MODEL_STORE_MAP[MODELS.Status]);
        }

        case MODELS.Status: {
          return await saveStatusData([record], MODEL_STORE_MAP[MODELS.Status]);
        }
      }
    }),
  );
}
