import { Injectable } from '@nestjs/common';
import { CreateTaskDto, PageTypeEnum } from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(createTaskDto: CreateTaskDto, workspaceId: string) {
    return this.prisma.task.create({
      data: {
        status: createTaskDto.status ? createTaskDto.status : 'Todo',
        ...createTaskDto,
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
        page: {
          create: {
            title: createTaskDto.title,
            sortOrder: '',
            tags: [],
            type: PageTypeEnum.Default,
            workspaceId,
          },
        },
      },
    });
  }
}
