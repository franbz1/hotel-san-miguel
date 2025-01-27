import { Module } from '@nestjs/common';
import { SireService } from './sire.service';

@Module({
  providers: [SireService],
})
export class SireModule {}
