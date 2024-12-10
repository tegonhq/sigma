import { IntegrationAccount } from '../integration-account';

export class Task {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  sourceId: string;
  url: string;
  status: string;
  metadata: any;

  pageId: string;
  integrationAccountId?: string;
  integrationAccount?: IntegrationAccount;
}
