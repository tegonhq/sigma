'use client';

import Dexie from 'dexie';

import type {
  IntegrationAccountType,
  PageType,
  StatusType,
} from 'common/types';
import type { LabelType } from 'common/types';
import type { WorkspaceType } from 'common/types';

import { MODELS } from './models';

export class SigmaDatabase extends Dexie {
  workspaces: Dexie.Table<WorkspaceType, string>;
  labels: Dexie.Table<LabelType, string>;
  integrationAccounts: Dexie.Table<IntegrationAccountType, string>;
  pages: Dexie.Table<PageType, string>;
  statuses: Dexie.Table<StatusType, string>;

  constructor(databaseName: string) {
    super(databaseName);

    this.version(9).stores({
      [MODELS.Workspace]: 'id,createdAt,updatedAt,name,slug,userId',
      [MODELS.Label]:
        'id,createdAt,updatedAt,name,color,description,workspaceId,groupId',
      [MODELS.IntegrationAccount]:
        'id,createdAt,updatedAt,accountId,settings,personal,integratedById,integrationDefinitionId,workspaceId',
      [MODELS.Page]:
        'id,createdAt,updatedAt,archived,title,description,parentId,sortOrder,workspaceId',
      [MODELS.Status]:
        'id,createdAt,updatedAt,name,position,color,workspaceId,description',
    });

    this.workspaces = this.table(MODELS.Workspace);
    this.labels = this.table(MODELS.Label);
    this.integrationAccounts = this.table(MODELS.IntegrationAccount);
    this.pages = this.table(MODELS.Page);
    this.statuses = this.table(MODELS.Status);
  }
}

export let sigmaDatabase: SigmaDatabase;

export function initDatabase(hash: number) {
  sigmaDatabase = new SigmaDatabase(`Sigma_${hash}`);
}

export async function resetDatabase() {
  localStorage.removeItem('lastSequenceId');

  if (sigmaDatabase) {
    await sigmaDatabase.delete();
  }
}
