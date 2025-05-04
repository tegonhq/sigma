import { IntegrationPayloadEventType } from '@tegonhq/sigma-sdk';

import { integrationCreate } from './account-create';
import { handleSchedule } from './schedule';

export interface IntegrationEventPayload {
  event: IntegrationPayloadEventType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

export async function run(eventPayload: IntegrationEventPayload) {
  switch (eventPayload.event) {
    case IntegrationPayloadEventType.INTEGRATION_ACCOUNT_CREATED:
      return await integrationCreate(
        eventPayload.userId,
        eventPayload.workspaceId,
        eventPayload.eventBody,
      );

    case IntegrationPayloadEventType.SCHEDULED_SYNC:
      return handleSchedule(eventPayload.eventBody);

    case IntegrationPayloadEventType.REFRESH_ACCESS_TOKEN:
      return eventPayload.eventBody.integrationAccount.integrationConfiguration.access_token;

    default:
      return {
        message: `The event payload type is ${eventPayload.event}`,
      };
  }
}
