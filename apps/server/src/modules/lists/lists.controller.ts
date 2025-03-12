import { Controller, Post, UseGuards } from '@nestjs/common';
import { List } from '@sigma/types';

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
  async createList(@Workspace() workspaceId: string): Promise<List> {
    return await this.lists.createList(workspaceId);
  }
}
