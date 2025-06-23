import { Module, Logger } from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { HabitacionesController } from './habitaciones.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SseModule } from 'src/sse/sse.module';
import { ConfiguracionAseoModule } from 'src/configuracion-aseo/configuracion-aseo.module';

@Module({
  controllers: [HabitacionesController],
  providers: [HabitacionesService, Logger],
  imports: [
    PrismaModule,
    AuthModule,
    ScheduleModule.forRoot(),
    SseModule,
    ConfiguracionAseoModule,
  ],
  exports: [HabitacionesService],
})
export class HabitacionesModule {}
