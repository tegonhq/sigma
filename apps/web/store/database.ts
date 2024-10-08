'use client';

import Dexie from 'dexie';

import type { IntegrationAccountType } from 'common/types';
import type { LabelType } from 'common/types';
import type { WorkspaceType } from 'common/types';

import { MODELS } from './models';

export class TegonDatabase extends Dexie {
  workspaces: Dexie.Table<WorkspaceType, string>;
  labels: Dexie.Table<LabelType, string>;
  integrationAccounts: Dexie.Table<IntegrationAccountType, string>;

  constructor(databaseName: string) {
    super(databaseName);

    this.version(7).stores({
      [MODELS.Workspace]: 'id,createdAt,updatedAt,name,slug,userId',
      [MODELS.Label]:
        'id,createdAt,updatedAt,name,color,description,workspaceId,groupId',
      [MODELS.IntegrationAccount]:
        'id,createdAt,updatedAt,accountId,settings,personal,integratedById,integrationDefinitionId,workspaceId',
    });

    this.workspaces = this.table(MODELS.Workspace);
    this.labels = this.table(MODELS.Label);
    this.integrationAccounts = this.table(MODELS.IntegrationAccount);
  }
}

export let tegonDatabase: TegonDatabase;

export function initDatabase(hash: number) {
  tegonDatabase = new TegonDatabase(`Tegon_${hash}`);
}

export async function resetDatabase() {
  localStorage.removeItem('lastSequenceId');

  if (tegonDatabase) {
    await tegonDatabase.delete();
  }
}
