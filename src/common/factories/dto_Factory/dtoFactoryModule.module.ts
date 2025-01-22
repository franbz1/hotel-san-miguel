import { Module } from '@nestjs/common';
import { DtoFactoryService } from './dtoFactoryService.service';

@Module({
  providers: [DtoFactoryService],
  exports: [DtoFactoryService],
})
export class DtoFactoryModule {}
