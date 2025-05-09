import { IntegrationPayloadEventType } from '@tegonhq/sigma-sdk';

import { integrationCreate } from './account-create';

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

    default:
      return {
        message: `The event payload type is ${eventPayload.event}`,
      };
  }
}
