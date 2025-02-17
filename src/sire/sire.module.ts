import { Module } from '@nestjs/common';
import { SireService } from './sire.service';
import { SireController } from './sire.controller';
import { CreateDocModule } from 'src/common/create-doc/create-doc.module';

@Module({
  providers: [SireService],
  controllers: [SireController],
  imports: [CreateDocModule],
  exports: [SireService],
})
export class SireModule {}
