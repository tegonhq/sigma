import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { ContentService } from './content.service';

@Module({
  imports: [],
  providers: [ContentService, PrismaService],
  exports: [ContentService],
})
export class ContentModule {}
