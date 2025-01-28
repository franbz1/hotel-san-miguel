import { Module } from '@nestjs/common';
import { SireService } from './sire.service';
import { SireController } from './sire.controller';

@Module({
  providers: [SireService],
  controllers: [SireController],
})
export class SireModule {}
