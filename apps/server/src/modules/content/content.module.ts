import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { ContentService } from './content.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ContentService, PrismaService],
})
export class ContentModule {}
