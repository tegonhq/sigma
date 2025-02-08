import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateListDto, List } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { ListsService } from './lists.service';

@Controller({
  version: '1',
  path: 'lists',
})
export class ListsController {
  constructor(private lists: ListsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createList(
    @Workspace() workspaceId: string,
    @Body() listData: CreateListDto,
  ): Promise<List> {
    return await this.lists.createList(workspaceId, listData.name);
  }
}
