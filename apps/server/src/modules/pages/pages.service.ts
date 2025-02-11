import { TiptapTransformer } from '@hocuspocus/transformer';
import { Injectable } from '@nestjs/common';
import {
  convertHtmlToTiptapJson,
  convertTiptapJsonToHtml,
  tiptapExtensions,
} from '@sigma/editor-extensions';
import {
  CreatePageDto,
  GetPageByTitleDto,
  Page,
  UpdatePageDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';
import * as Y from 'yjs';

import { PageSelect } from './pages.interface';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async getPageByTitle(
    workspaceId: string,
    getPageByTitleDto: GetPageByTitleDto,
  ): Promise<Page> {
    const page = await this.prisma.page.findFirst({
      where: {
        title: getPageByTitleDto.title,
        type: getPageByTitleDto.type,
        workspaceId,
        deleted: null,
      },
      select: PageSelect,
    });

    if (page?.description) {
      const descriptionJson = JSON.parse(page.description);
      page.description = convertTiptapJsonToHtml(descriptionJson);
    }

    return page;
  }

  async getOrCreatePageByTitle(
    workspaceId: string,
    getPageByTitleDto: GetPageByTitleDto,
  ): Promise<Page> {
    // Try to find existing page
    const existingPage = await this.prisma.page.findFirst({
      where: {
        title: getPageByTitleDto.title,
        type: getPageByTitleDto.type,
        workspaceId,
        deleted: null,
      },
      select: PageSelect,
    });

    if (existingPage) {
      if (existingPage.description) {
        const descriptionJson = JSON.parse(existingPage.description);
        existingPage.description = convertTiptapJsonToHtml(descriptionJson);
      }
      return existingPage;
    }

    // Create new page if not found
    return this.prisma.page.create({
      data: {
        title: getPageByTitleDto.title,
        type: getPageByTitleDto.type,
        workspace: { connect: { id: workspaceId } },
        sortOrder: '',
        tags: [],
      },
      select: PageSelect,
    });
  }

  async getPage(pageId: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({
      where: {
        id: pageId,
        deleted: null,
      },
      select: PageSelect,
    });

    if (page?.description) {
      const descriptionJson = JSON.parse(page.description);
      page.description = convertTiptapJsonToHtml(descriptionJson);
    }

    return page;
  }

  async createPage(
    { parentId, description, htmlDescription, ...pageData }: CreatePageDto,
    workspaceId: string,
  ): Promise<Page> {
    let finalDescription = description;
    if (htmlDescription && !description) {
      finalDescription = JSON.stringify(
        await convertHtmlToTiptapJson(htmlDescription),
      );
    }

    return this.prisma.page.create({
      data: {
        ...pageData,
        description: finalDescription,
        workspace: { connect: { id: workspaceId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });
  }

  async updatePage(
    { parentId, description, htmlDescription, ...pageData }: UpdatePageDto,
    pageId: string,
  ): Promise<Page> {
    let finalDescription = description;
    if (htmlDescription && !description) {
      finalDescription = JSON.stringify(
        await convertHtmlToTiptapJson(htmlDescription),
      );
    }

    // Initialize YDoc with existing state
    const ydoc = new Y.Doc();

    if (finalDescription) {
      // Parse the JSON description if it's a string
      const descriptionJson =
        typeof finalDescription === 'string'
          ? JSON.parse(finalDescription)
          : finalDescription;

      // Convert Tiptap JSON to YDoc
      const newYDoc = TiptapTransformer.toYdoc(
        descriptionJson,
        'default',
        tiptapExtensions,
      );
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(newYDoc));
    }

    // Get the binary state
    const binaryState = Y.encodeStateAsUpdate(ydoc);

    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        ...pageData,
        description: finalDescription,
        descriptionBinary: Buffer.from(binaryState),
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
      select: PageSelect,
    });
  }

  async deletePage(pageId: string): Promise<Page> {
    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        deleted: new Date(),
      },
      select: PageSelect,
    });
  }
}
