import { Server } from '@hocuspocus/server';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { LoggerService } from 'modules/logger/logger.service';
import { isValidAuthentication } from 'modules/sync/sync.utils';

@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService('ContentGateway');

  async onModuleInit() {
    const loggerScope = this.logger;

    const server = Server.configure({
      name: 'sigma-collab',
      port: 1234,

      async onAuthenticate(data) {
        const isValid = isValidAuthentication(data.requestHeaders);

        if (!isValid) {
          loggerScope.info({
            message: `Connection disconnected`,
            where: `ContentGateway.handleConnection`,
          });
        }
      },
    });

    server.listen();
  }
}
