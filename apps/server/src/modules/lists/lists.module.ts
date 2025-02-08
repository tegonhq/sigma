import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { UsersService } from 'modules/users/users.service';

import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [PrismaModule],
  controllers: [ListsController],
  providers: [PrismaService, ListsService, UsersService],
  exports: [ListsService],
})
export class ListsModule {}
