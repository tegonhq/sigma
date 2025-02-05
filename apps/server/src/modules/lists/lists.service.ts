import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async createList(workspaceId: string, name: string) {
    return await this.prisma.list.create({
      data: {
        workspaceId,
        name,
      },
    });
  }
}
