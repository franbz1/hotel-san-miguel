import { Module } from '@nestjs/common';
import { HuespedesService } from './huespedes.service';
import { HuespedesController } from './huespedes.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { DocumentosModule } from 'src/documentos/documentos.module';

@Module({
  controllers: [HuespedesController],
  providers: [HuespedesService],
  imports: [PrismaModule, DocumentosModule],
  exports: [HuespedesService],
})
export class HuespedesModule {}
