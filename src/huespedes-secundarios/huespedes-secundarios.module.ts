import { Module } from '@nestjs/common';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';
import { HuespedesSecundariosController } from './huespedes-secundarios.controller';
import { HuespedesModule } from 'src/huespedes/huespedes.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [HuespedesSecundariosController],
  providers: [HuespedesSecundariosService],
  imports: [HuespedesModule, PrismaModule],
  exports: [HuespedesSecundariosService],
})
export class HuespedesSecundariosModule {}
