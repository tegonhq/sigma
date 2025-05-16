// apps/server/src/modules/vector-store/vector-store.module.ts
import { Module } from '@nestjs/common';

import { VectorStoreService } from './vector.service';

@Module({
  providers: [VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}
