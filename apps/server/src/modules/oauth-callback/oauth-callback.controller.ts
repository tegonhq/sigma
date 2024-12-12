import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SessionContainer } from 'supertokens-node/recipe/session';

import { AuthGuard } from 'modules/auth/auth.guard';
import {
  Session as SessionDecorator,
  Workspace,
} from 'modules/auth/session.decorator';

import { OAuthBodyInterface, CallbackParams } from './oauth-callback.interface';
import { OAuthCallbackService } from './oauth-callback.service';

@Controller({
  version: '1',
  path: 'oauth',
})
export class OAuthCallbackController {
  constructor(private oAuthCallbackService: OAuthCallbackService) {}

  @Post()
  @UseGuards(AuthGuard)
  async getRedirectURL(
    @SessionDecorator() session: SessionContainer,
    @Workspace() workspaceId: string,
    @Body() body: OAuthBodyInterface,
  ) {
    const userId = session.getUserId();
    return await this.oAuthCallbackService.getRedirectURL(
      body,
      userId,
      workspaceId,
    );
  }

  @Get('callback')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async callback(@Query() queryParams: CallbackParams, @Res() res: any) {
    return await this.oAuthCallbackService.callbackHandler(queryParams, res);
  }
}
