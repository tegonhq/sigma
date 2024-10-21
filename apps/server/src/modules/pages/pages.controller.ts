import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreatePageDto,
  Page,
  PageRequestParamsDto,
  UpdatePageDto,
} from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { PagesService } from './pages.service';

@Controller({
  version: '1',
  path: 'pages',
})
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPage(
    @Workspace() workspaceId: string,
    @Body() pageData: CreatePageDto,
  ): Promise<Page> {
    return await this.pagesService.createPage(pageData, workspaceId);
  }

  @Post(':pageId')
  @UseGuards(AuthGuard)
  async updateIssue(
    @Param() pageParams: PageRequestParamsDto,
    @Body() pageData: UpdatePageDto,
  ): Promise<Page> {
    return await this.pagesService.updatePage(pageData, pageParams.pageId);
  }

  @Delete(':pageId')
  @UseGuards(AuthGuard)
  async deletePage(@Param() pageParams: PageRequestParamsDto): Promise<Page> {
    return await this.pagesService.deletePage(pageParams.pageId);
  }
}
