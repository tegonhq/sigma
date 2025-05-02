import { Body, Controller, Post, Headers, Param, Res } from '@nestjs/common';
import { EventBody, EventHeaders } from '@tegonhq/sigma-sdk';
import { Response } from 'express';

import WebhookService from './webhook.service';

@Controller({
  version: '1',
  path: 'webhook',
})
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post(':sourceName/:integrationAccountId?')
  async webhookEvents(
    @Headers() eventHeaders: EventHeaders,
    @Param('sourceName') sourceName: string,
    @Param('integrationAccountId') integrationAccountId: string | undefined,
    @Body() eventBody: EventBody,
    @Res() response: Response,
  ) {
    const eventResponse = await this.webhookService.handleEvents(
      response,
      sourceName,
      integrationAccountId || undefined,
      eventHeaders,
      eventBody,
    );
    return eventResponse;
  }
}
