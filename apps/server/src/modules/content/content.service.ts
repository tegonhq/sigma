import { Database } from '@hocuspocus/extension-database';
import { Hocuspocus, Server } from '@hocuspocus/server';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { getSchema } from '@sol/editor-extensions';
import { PrismaService } from 'nestjs-prisma';
import { prosemirrorJSONToYXmlFragment } from 'y-prosemirror';

import { LoggerService } from 'modules/logger/logger.service';
import { isValidAuthentication } from 'modules/sync/sync.utils';
@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService('ContentService');
  private server: Hocuspocus;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const loggerScope = this.logger;
    if (this.server) {
      return;
    }

    this.server = Server.configure({
      name: 'sol-collab',
      port: 1234,
      timeout: 30000, // Configure timeout for operations
      debounce: 3000, // Debounce time for updates
      maxDebounce: 10000, // Maximum debounce time
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
          },
        }),
      ],
      async onConnect(data) {
        const isValid = isValidAuthentication(data.requestHeaders);

        if (!isValid) {
          loggerScope.info({
            message: `Connection disconnected`,
            where: `ContentGateway.handleConnection`,
          });

          throw new Error('Unable to connect');
        }
      },
    });

    await this.server.listen();
  }

  // Update any page from the server
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateContentForDocument(documentName: string, json: any) {
    const docConnection = await this.server.openDirectConnection(
      documentName,
      {},
    );

    await docConnection.transact((doc) => {
      const editorState = doc.getXmlFragment('default');

      try {
        prosemirrorJSONToYXmlFragment(getSchema(), json, editorState);
      } catch (e) {
        console.log(e);
        this.logger.error(e);
      }
    });
  }
}
