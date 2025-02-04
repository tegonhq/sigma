import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import {
  loadRemoteModule,
  getRequires,
  createAxiosInstance,
} from 'common/remote-loader';

import { LoggerService } from 'modules/logger/logger.service';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class IntegrationsService {
  private readonly logger = new LoggerService(IntegrationsService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  //

  async loadIntegration(slug: string, userId?: string, workspaceId?: string) {
    this.logger.info({
      message: `Loading integration ${slug}`,
      where: 'IntegrationsService.loadIntegration',
    });

    let pat = '';
    if (userId) {
      pat = await this.usersService.getOrCreatePat(userId, workspaceId);
    }

    const integrationFunction = await loadRemoteModule(
      getRequires(createAxiosInstance(pat)),
    );

    const integrationDefinition =
      await this.prisma.integrationDefinitionV2.findFirst({
        where: { slug, deleted: null },
      });

    return await integrationFunction(
      `${integrationDefinition.url}/backend/index.js`,
    );
  }
}
