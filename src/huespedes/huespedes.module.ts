import { Module } from '@nestjs/common';
import { HuespedesService } from './huespedes.service';
import { HuespedesController } from './huespedes.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { DocumentosModule } from 'src/documentos/documentos.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [HuespedesController],
  providers: [HuespedesService],
  imports: [PrismaModule, DocumentosModule, AuthModule],
  exports: [HuespedesService],
})
export class HuespedesModule {}
