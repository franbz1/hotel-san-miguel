import { Module } from '@nestjs/common';
import { CreateDocService } from './create-doc.service';

@Module({
  providers: [CreateDocService],
  exports: [CreateDocService],
})
export class CreateDocModule {}
