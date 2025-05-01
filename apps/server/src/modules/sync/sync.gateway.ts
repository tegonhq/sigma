import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { LoggerService } from 'modules/logger/logger.service';

import { ClientMetadata } from './sync.interface';
import { isValidAuthentication } from './sync.utils';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_HOST.split(',') || '',
    credentials: true,
  },
})
export class SyncGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private readonly clientsMetadata: Record<string, ClientMetadata> = {};
  private readonly logger: LoggerService = new LoggerService('SyncGateway');
  private connectionCount = 0;

  afterInit() {
    this.logger.info({
      message: 'Websocket Module initiated',
      where: `SyncGateway.afterInit`,
    });
  }

  async handleConnection(client: Socket) {
    this.connectionCount++;
    const { query, headers } = client.handshake;

    this.logger.info({
      message: `Connection is made by ${client.id}  userId ${query.userId}. Total connections: ${this.connectionCount}`,
      where: `SyncGateway.handleConnection`,
    });

    const isValid = isValidAuthentication(headers);

    if (!isValid) {
      this.connectionCount--;
      this.logger.info({
        message: `Connection disconnected ${client.id} userId ${query.userId}. Total connections: ${this.connectionCount}`,
        where: `SyncGateway.handleConnection`,
      });
      client.disconnect(true);
      return;
    }

    this.clientsMetadata[client.id] = {
      workspaceId: query.workspaceId as string,
      userId: query.userId as string,
    };

    client.join(query.workspaceId);
    client.join(query.userId);
  }

  handleDisconnect(client: Socket) {
    this.connectionCount--;
    const currentClient = this.clientsMetadata[client.id];
    delete this.clientsMetadata[client.id];
    this.logger.info({
      message: `Client disconnected: ${client.id} userId ${currentClient.userId}. Total connections: ${this.connectionCount}`,
      where: `SyncGateway.handleDisconnect`,
    });
  }
}
