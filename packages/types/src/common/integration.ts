export enum IntegrationPayloadEventType {
  /**
   * This is used to identify to which integration account the webhook belongs to
   */
  GET_CONNECTED_ACCOUNT_ID = 'get_connected_account_id',

  /**
   * This is used to create/delete a integration account from the
   * user input
   */
  CREATE = 'create',
  DELETE = 'delete',

  // When the extension gets a external webhook
  SOURCE_WEBHOOK = 'source_webhook',

  // Get a fresh token for the integration
  GET_TOKEN = 'get_token',

  // Valid and return the response for webhooks
  WEBHOOK_RESPONSE = 'webhook_response',

  SCHEDULED_TASK = 'scheduled_task',

  SYNC_INITIAL_TASK = 'sync_initial_task',

  // Model changes
  TASK = 'task',
  ACTIVITY = 'activity',
  PAGE = 'page',
}

export interface IntegrationEventPayload {
  event: IntegrationPayloadEventType;
  [x: string]: any;
}
