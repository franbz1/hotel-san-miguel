import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService],
  imports: [PrismaModule, AuthModule],
  exports: [DocumentosService],
})
export class DocumentosModule {}
