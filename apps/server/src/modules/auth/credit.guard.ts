import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Session from 'supertokens-node/recipe/session';

import { UsersService } from 'modules/users/users.service';

@Injectable()
export class CreditsGuard implements CanActivate {
  constructor(private moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();

    const resp = ctx.getResponse();
    const request = ctx.getRequest();

    const usersService = await this.moduleRef.resolve(UsersService);
    const session = await Session.getSession(request, resp, {
      sessionRequired: false,
    });
    const userId = session.getUserId();

    const hasCredits = await usersService.hasAvailableCredits(userId);
    if (!hasCredits) {
      throw new BadRequestException('No credits available');
    }

    return hasCredits;
  }
}
