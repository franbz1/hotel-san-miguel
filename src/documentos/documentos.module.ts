import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService],
  imports: [PrismaModule],
  exports: [DocumentosService],
})
export class DocumentosModule {}
