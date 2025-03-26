import { IntegrationAccount } from '../integration-account';
import { Task } from '../task';

export enum IntegrationPayloadEventType {
  /**
   * When a webhook is received, this event is triggered to identify which integration
   * account the webhook belongs to
   */
  IDENTIFY_WEBHOOK_ACCOUNT = 'identify_webhook_account',

  /**
   * Lifecycle events for integration accounts
   */
  INTEGRATION_ACCOUNT_CREATED = 'integration_account_created',
  INTEGRATION_ACCOUNT_DELETED = 'integration_account_deleted',

  /**
   * When data is received from the integration source (e.g. new Slack message)
   */
  INTEGRATION_DATA_RECEIVED = 'integration_data_received',

  /**
   * Request to refresh/get latest access token for the integration
   */
  REFRESH_ACCESS_TOKEN = 'refresh_access_token',

  /**
   * For integrations without webhook support, this event is triggered at the
   * configured frequency to sync data
   */
  SCHEDULED_SYNC = 'scheduled_sync',

  /**
   * Initial sync event triggered when integration is first installed to import
   * existing tasks
   */
  INITIAL_TASK_SYNC = 'initial_task_sync',

  /**
   * When a task created by this integration is updated or deleted
   */
  INTEGRATION_TASK_UPDATED = 'integration_task_updated',
}

export interface IntegrationEventPayload {
  event: IntegrationPayloadEventType;
  [x: string]: any;
}

// Used in frontend
/**
 * Represents the different views where task integration metadata can be displayed:
 * - SINGLE_TASK: Full task view showing complete integration details
 * - TASK_LIST_ITEM: Compact view shown in task list/table rows
 */
export enum TaskIntegrationViewType {
  SINGLE_TASK = 'SINGLE_TASK', // Full task view with complete integration details
  TASK_LIST_ITEM = 'TASK_LIST_ITEM', // Compact view in task list/table rows
}

export interface TaskIntegrationMetadataProps {
  task: Task;
  integrationAccount: IntegrationAccount;
  view: TaskIntegrationViewType;
}
