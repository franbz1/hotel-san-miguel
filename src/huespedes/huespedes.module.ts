import { Module } from '@nestjs/common';
import { HuespedesService } from './huespedes.service';
import { HuespedesController } from './huespedes.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [HuespedesController],
  providers: [HuespedesService],
  imports: [PrismaModule],
})
export class HuespedesModule {}
