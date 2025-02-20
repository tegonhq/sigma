import { Database } from '@hocuspocus/extension-database';
import { Hocuspocus, Server } from '@hocuspocus/server';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { LoggerService } from 'modules/logger/logger.service';
import { isValidAuthentication } from 'modules/sync/sync.utils';
import { TasksService } from 'modules/tasks/tasks.service';
import { yXmlFragmentToProsemirrorJSON } from 'y-prosemirror';
@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService('ContentGateway');
  private server: Hocuspocus;

  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService,
  ) {}

  async onModuleInit() {
    const loggerScope = this.logger;

    this.server = Server.configure({
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
          store: async ({ documentName, document, state }) => {
            await this.prisma.page.update({
              where: { id: documentName },
              data: {
                descriptionBinary: state,
                description: JSON.stringify(
                  TiptapTransformer.fromYdoc(document).default,
                ),
              },
            });

            console.log(
              JSON.stringify(TiptapTransformer.fromYdoc(document).default),
            );

            this.tasksService.clearDeletedTasksFromPage(
              TiptapTransformer.fromYdoc(document).default,
              documentName,
            );
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

    this.server.listen();

    const docConnection = await this.server.openDirectConnection(
      'fdd4a2ee-8f5d-4452-91de-505b55a17ff5',
      {},
    );

    await docConnection.transact((doc) => {
      const editorState = doc.getXmlFragment('default');

      console.log(editorState.toString());
    });
  }
}
