import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { List, PageTypeEnum, Task, UpdateListDto } from '@tegonhq/sigma-sdk';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async createList(workspaceId: string, title?: string) {
    return await this.prisma.list.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        page: {
          create: {
            sortOrder: '',
            tags: [],
            type: PageTypeEnum.List,
            workspace: { connect: { id: workspaceId } },
            ...(title ? { title } : {}),
          },
        },
      },
    });
  }

  async getList(listId: string) {
    const list = await this.prisma.list.findUnique({
      where: {
        id: listId,
        deleted: null,
      },
      include: {
        page: true,
      },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    return list;
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

  async deleteList(listId: string) {
    // First check if the list exists
    const list = await this.prisma.list.findUnique({
      where: {
        id: listId,
        deleted: null,
      },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Check if there are any tasks associated with this list
    const tasksCount = await this.prisma.task.count({
      where: {
        listId,
        deleted: null,
      },
    });

    if (tasksCount > 0) {
      throw new BadRequestException(
        `Cannot delete list with ID ${listId} because it has ${tasksCount} associated tasks`,
      );
    }

    // If no tasks are associated, proceed with the soft delete
    return await this.prisma.list.update({
      where: {
        id: listId,
      },
      data: {
        deleted: new Date().toISOString(),
      },
    });
  }

  async getAllLists(
    workspaceId: string,
    page: number,
    size: number,
  ): Promise<List[]> {
    const skip = (page - 1) * size;
    return await this.prisma.list.findMany({
      where: { deleted: null, workspaceId },
      include: {
        page: { select: { id: true, title: true } },
      },
      skip,
      take: size,
    });
  }

  async getListTasks(listId: string): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { listId, deleted: null },
    });
  }
}
