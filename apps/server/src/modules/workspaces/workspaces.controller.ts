import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Workspace, WorkspaceRequestParamsDto } from '@sigma/types';
import { SessionContainer } from 'supertokens-node/recipe/session';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Session as SessionDecorator } from 'modules/auth/session.decorator';

import {
  CreateInitialResourcesDto,
  UpdateWorkspaceInput,
} from './workspaces.interface';
import WorkspacesService from './workspaces.service';

@Controller({
  version: '1',
  path: 'workspaces',
})
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post('onboarding')
  @UseGuards(AuthGuard)
  async createIntialResources(
    @SessionDecorator() session: SessionContainer,
    @Body() workspaceData: CreateInitialResourcesDto,
  ): Promise<Workspace> {
    const userId = session.getUserId();
    return await this.workspacesService.createInitialResources(
      userId,
      workspaceData,
    );
  }

  @Get('slug/:workspaceSlug')
  @UseGuards(AuthGuard)
  async getWorkspaceBySlug(
    @Param('workspaceSlug') workspaceSlug: string,
  ): Promise<Workspace> {
    return await this.workspacesService.getWorkspaceBySlug(workspaceSlug);
  }

  @Get(':workspaceId')
  @UseGuards(AuthGuard)
  async getWorkspace(
    @Param()
    workspaceId: WorkspaceRequestParamsDto,
  ): Promise<Workspace> {
    return await this.workspacesService.getWorkspace(workspaceId);
  }

  @Post(':workspaceId')
  @UseGuards(AuthGuard)
  async updateWorkspace(
    @Param()
    workspaceId: WorkspaceRequestParamsDto,
    @Body() workspaceData: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    return await this.workspacesService.updateWorkspace(
      workspaceId,
      workspaceData,
    );
  }

  @Delete(':workspaceId')
  @UseGuards(AuthGuard)
  async deleteWorkspace(
    @Param()
    workspaceId: WorkspaceRequestParamsDto,
  ): Promise<Workspace> {
    return await this.workspacesService.deleteWorkspace(workspaceId);
  }
}
