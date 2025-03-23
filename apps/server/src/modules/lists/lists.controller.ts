import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { List, UpdateListDto, ListIdDto } from '@tegonhq/sigma-sdk';

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

  @Post(':listId')
  @UseGuards(AuthGuard)
  async updateList(
    @Param() listIdDto: ListIdDto,
    @Body() updateListDto: UpdateListDto,
  ): Promise<List> {
    return await this.lists.updateList(listIdDto.listId, updateListDto);
  }

  @Delete(':listId')
  @UseGuards(AuthGuard)
  async deleteList(@Param() listIdDto: ListIdDto): Promise<List> {
    return await this.lists.deleteList(listIdDto.listId);
  }
}
