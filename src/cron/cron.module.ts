import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { SseModule } from 'src/sse/sse.module';
import { HabitacionesModule } from 'src/habitaciones/habitaciones.module';
import { AuthModule } from 'src/auth/auth.module';
import { AseoCronService } from './aseo-cron.service';
import { ConfiguracionAseoModule } from 'src/configuracion-aseo/configuracion-aseo.module';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';
import { ReportesAseoService } from 'src/reportes-aseo/reportes-aseo.service';

@Module({
  imports: [
    PrismaModule,
    SseModule,
    HabitacionesModule,
    AuthModule,
    ConfiguracionAseoModule,
    NotificacionesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CronController],
  providers: [CronService, AseoCronService, ReportesAseoService],
  exports: [CronService],
})
export class CronModule {}
