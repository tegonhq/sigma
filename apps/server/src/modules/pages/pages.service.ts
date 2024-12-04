import { Injectable } from '@nestjs/common';
import {
  CreatePageDto,
  GetPageByTitleDto,
  Page,
  UpdatePageDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async getPageByTitle(
    workspaceId: string,
    getPageByTitleDto: GetPageByTitleDto,
  ): Promise<Page> {
    return this.prisma.page.findFirst({
      where: {
        title: getPageByTitleDto.title,
        type: getPageByTitleDto.type,
        workspaceId,
        deleted: null,
      },
    });
  }

  async getPage(pageId: string): Promise<Page> {
    return this.prisma.page.findUnique({
      where: {
        id: pageId,
        deleted: null,
      },
    });
  }

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
        ...(parentId
          ? { parent: { connect: { id: parentId } } }
          : { parentId }),
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
