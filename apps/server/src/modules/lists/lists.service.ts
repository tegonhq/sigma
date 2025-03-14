import { Injectable } from '@nestjs/common';
import { PageTypeEnum, UpdateListDto } from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async createList(workspaceId: string) {
    return await this.prisma.list.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        page: {
          create: {
            sortOrder: '',
            tags: [],
            type: PageTypeEnum.List,
            workspace: { connect: { id: workspaceId } },
          },
        },
      },
    });
  }

  async updateList(listId: string, updateListDto: UpdateListDto) {
    return await this.prisma.list.update({
      where: {
        id: listId,
      },
      data: {
        icon: updateListDto.icon,
      },
    });
  }
}
