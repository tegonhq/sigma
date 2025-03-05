import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreatePageDto,
  EnhancePageResponse,
  GetPageByTitleDto,
  MoveTaskToPageDto,
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
  @Get(':pageId')
  @UseGuards(AuthGuard)
  async getPage(@Param() pageParams: PageRequestParamsDto): Promise<Page> {
    return await this.pagesService.getPage(pageParams.pageId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getPageByTitle(
    @Workspace() workspaceId: string,
    @Query() getPageByTitleDto: GetPageByTitleDto,
  ): Promise<Page> {
    return await this.pagesService.getOrCreatePageByTitle(
      workspaceId,
      getPageByTitleDto,
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPage(
    @Workspace() workspaceId: string,
    @Body() pageData: CreatePageDto,
  ): Promise<Page> {
    return await this.pagesService.createPage(pageData, workspaceId);
  }

  @Post('move-task')
  @UseGuards(AuthGuard)
  async moveTaskToPage(@Body() moveTaskToPageData: MoveTaskToPageDto) {
    return await this.pagesService.moveTaskToPage(moveTaskToPageData);
  }

  @Post(':pageId')
  @UseGuards(AuthGuard)
  async updateIssue(
    @Param() pageParams: PageRequestParamsDto,
    @Body() pageData: UpdatePageDto,
  ): Promise<Page> {
    return await this.pagesService.updatePage(pageData, pageParams.pageId);
  }

  @Post(':pageId/enhance')
  @UseGuards(AuthGuard)
  async enhancePage(
    @Param() pageParams: PageRequestParamsDto,
  ): Promise<EnhancePageResponse[]> {
    return await this.pagesService.enhancePage(pageParams.pageId);
  }

  @Delete(':pageId')
  @UseGuards(AuthGuard)
  async deletePage(@Param() pageParams: PageRequestParamsDto): Promise<Page> {
    return await this.pagesService.deletePage(pageParams.pageId);
  }
}
