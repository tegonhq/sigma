import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionContainer } from 'supertokens-node/recipe/session';

export const Session = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.session;
  },
);

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const session = request.session as SessionContainer;
    try {
      const userId = session.getUserId();

      return userId;
    } catch (e) {
      throw new UnauthorizedException('Not authorised');
    }
  },
);

export const Workspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const session = request.session as SessionContainer;
    try {
      const workspaceId = session.getAccessTokenPayload().workspaceId;

      return workspaceId;
    } catch (e) {
      throw new UnauthorizedException('Not authorised');
    }
  },
);

export const Role = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const session = request.session as SessionContainer;
    try {
      const role = session.getAccessTokenPayload().role;

      return role;
    } catch (e) {
      throw new UnauthorizedException('Not authorised');
    }
  },
);
