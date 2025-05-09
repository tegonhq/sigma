import { IntegrationPayloadEventType } from '@tegonhq/sigma-sdk';

import { integrationCreate } from './account-create';
import { createActivityEvent } from './create-activity';

export interface IntegrationEventPayload {
  event: IntegrationPayloadEventType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

export async function run(eventPayload: IntegrationEventPayload) {
  switch (eventPayload.event) {
    case IntegrationPayloadEventType.INTEGRATION_ACCOUNT_CREATED:
      return await integrationCreate(eventPayload.eventBody, eventPayload.integrationDefinition);

    case IntegrationPayloadEventType.IDENTIFY_WEBHOOK_ACCOUNT:
      return eventPayload.eventBody.event.user;

    case IntegrationPayloadEventType.INTEGRATION_DATA_RECEIVED:
      return createActivityEvent(eventPayload.eventBody, eventPayload.integrationAccount);

    case IntegrationPayloadEventType.REFRESH_ACCESS_TOKEN:
      return eventPayload.integrationAccount.integrationConfiguration.access_token;

    default:
      return {
        message: `The event payload type is ${eventPayload.event}`,
      };
  }
}
