import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CodeDto, CreatePatDto, PatIdDto, User } from '@redplanethq/sol-sdk';
import { Request, Response } from 'express';
import supertokens from 'supertokens-node';
import { SessionContainer } from 'supertokens-node/recipe/session';
import Session from 'supertokens-node/recipe/session';

import { AuthGuard } from 'modules/auth/auth.guard';
import {
  Session as SessionDecorator,
  UserId,
  Workspace,
} from 'modules/auth/session.decorator';

import { UpdateUserBody, UserIdParams } from './users.interface';
import { UsersService } from './users.service';

@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getUser(@SessionDecorator() session: SessionContainer): Promise<User> {
    const userId = session.getUserId();
    const user = await this.users.getUser(userId);

    return user;
  }

  @Get('email')
  @UseGuards(AuthGuard)
  async getUserByEmail(@Query('email') email: string): Promise<User> {
    const user = await this.users.getUserByEmail(email);
    return user;
  }

  @Post('pat')
  @UseGuards(AuthGuard)
  async createPersonalAccessToken(
    @Workspace() workspaceId: string,
    @SessionDecorator() session: SessionContainer,
    @Body()
    createPatDto: CreatePatDto,
  ) {
    const userId = session.getUserId();
    const user = await this.users.createPersonalAccessToken(
      createPatDto.name,
      userId,
      workspaceId,
    );

    return user;
  }

  @Post('pat-for-code')
  async getPatForCode(
    @Body()
    codeBody: CodeDto,
  ) {
    return await this.users.getPersonalAccessTokenFromAuthorizationCode(
      codeBody.code,
    );
  }

  @Get('pat-authentication')
  @UseGuards(AuthGuard)
  async getPatAuthentication(
    @UserId() userId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    await Session.createNewSession(
      req,
      res,
      'public',
      supertokens.convertToRecipeUserId(userId),
    );

    res.send({ status: 200 });
  }

  @Get('pats')
  @UseGuards(AuthGuard)
  async getPats(@SessionDecorator() session: SessionContainer) {
    const userId = session.getUserId();
    return await this.users.getPats(userId);
  }

  @Delete('pats/:patId')
  @UseGuards(AuthGuard)
  async deletePat(@Param() patIdDto: PatIdDto) {
    return await this.users.deletePat(patIdDto.patId);
  }

  @Get('authorization')
  async createAuthorizationCode(): Promise<CodeDto> {
    return this.users.generateAuthorizationCode();
  }

  @Post('authorization')
  @UseGuards(AuthGuard)
  async authorizeCode(
    @UserId() userId: string,
    @Workspace() workspaceId: string,
    @Body()
    codeBody: CodeDto,
  ) {
    return this.users.authorizeCode(userId, workspaceId, codeBody);
  }

  @Post(':userId')
  async updateUser(
    @Param() userIdBody: UserIdParams,
    @Body()
    updateUserBody: UpdateUserBody,
  ): Promise<User> {
    const user = await this.users.updateUser(userIdBody.userId, updateUserBody);

    return user;
  }
}
