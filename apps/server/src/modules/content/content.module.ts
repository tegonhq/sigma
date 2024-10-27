import { Module } from '@nestjs/common';

import { ContentService } from './content.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ContentService],
})
export class ContentModule {}
