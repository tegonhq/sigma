import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { PagesModule } from 'modules/pages/pages.module';
import { UsersService } from 'modules/users/users.service';

import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [PrismaModule, PagesModule],
  controllers: [ListsController],
  providers: [PrismaService, ListsService, UsersService],
  exports: [ListsService],
})
export class ListsModule {}
