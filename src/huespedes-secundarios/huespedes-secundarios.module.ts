import { Module } from '@nestjs/common';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';
import { HuespedesSecundariosController } from './huespedes-secundarios.controller';
import { HuespedesModule } from 'src/huespedes/huespedes.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [HuespedesSecundariosController],
  providers: [HuespedesSecundariosService],
  imports: [HuespedesModule, PrismaModule, AuthModule],
  exports: [HuespedesSecundariosService],
})
export class HuespedesSecundariosModule {}
