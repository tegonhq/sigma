import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export default class AutomationService {
  constructor(private prisma: PrismaService) {}

  async createAutomation(text: string, mcps: string[], workspaceId: string) {
    await this.prisma.automation.create({
      data: {
        text,
        mcps,
        workspaceId,
      },
    });
  }

  async updateAutomation(
    automationId: string,
    text: string,
    mcps: string[],
    workspaceId: string,
  ) {
    await this.prisma.automation.update({
      where: {
        id: automationId,
        workspaceId,
      },
      data: {
        text,
        mcps,
      },
    });
  }

  async deleteAutomation(automationId: string, workspaceId: string) {
    await this.prisma.automation.update({
      where: {
        id: automationId,
        workspaceId,
      },
      data: {
        deleted: new Date(),
      },
    });
  }
}
