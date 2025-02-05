import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { ListsService } from './lists.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [PrismaService, ListsService],
  exports: [ListsService],
})
export class ListsModule {}
