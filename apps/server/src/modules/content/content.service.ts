import { Database } from '@hocuspocus/extension-database';
import { Server } from '@hocuspocus/server';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { LoggerService } from 'modules/logger/logger.service';
import { isValidAuthentication } from 'modules/sync/sync.utils';
@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService('ContentGateway');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const loggerScope = this.logger;

    const server = Server.configure({
      name: 'sigma-collab',
      port: 1234,
      extensions: [
        new Database({
          // Return a Promise to retrieve data …
          fetch: async ({ documentName }) => {
            const page = await this.prisma.page.findUnique({
              where: { id: documentName },
            });
            return page.descriptionBinary;
          },
          // … and a Promise to store data:
          store: async ({ documentName, state }) => {
            await this.prisma.page.update({
              where: { id: documentName },
              data: { descriptionBinary: state },
            });
          },
        }),
      ],

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
