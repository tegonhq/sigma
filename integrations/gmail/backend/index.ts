import { IntegrationPayloadEventType } from '@redplanethq/sol-sdk';

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
      return await integrationCreate(eventPayload.eventBody, eventPayload.integrationDefinition);

    case IntegrationPayloadEventType.SCHEDULED_SYNC:
      return handleSchedule(eventPayload.integrationAccount, eventPayload.integrationDefinition);

    default:
      return {
        message: `The event payload type is ${eventPayload.event}`,
      };
  }
}
