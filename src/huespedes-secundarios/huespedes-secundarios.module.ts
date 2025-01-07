import { Module } from '@nestjs/common';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';
import { HuespedesSecundariosController } from './huespedes-secundarios.controller';
import { HuespedesModule } from 'src/huespedes/huespedes.module';

@Module({
  controllers: [HuespedesSecundariosController],
  providers: [HuespedesSecundariosService],
  imports: [HuespedesModule],
})
export class HuespedesSecundariosModule {}
