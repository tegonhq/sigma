import { Injectable } from '@nestjs/common';
import { CreatePageDto, Page, UpdatePageDto } from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async createPage(
    { parentId, ...pageData }: CreatePageDto,
    workspaceId: string,
  ): Promise<Page> {
    return this.prisma.page.create({
      data: {
        ...pageData,
        workspace: { connect: { id: workspaceId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });
  }

  async updatePage(
    { parentId, ...pageData }: UpdatePageDto,
    pageId: string,
  ): Promise<Page> {
    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        ...pageData,
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });
  }

  async deletePage(pageId: string): Promise<Page> {
    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        deleted: new Date(),
      },
    });
  }
}
