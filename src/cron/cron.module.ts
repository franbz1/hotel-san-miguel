import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { SseModule } from 'src/sse/sse.module';
import { HabitacionesModule } from 'src/habitaciones/habitaciones.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, SseModule, HabitacionesModule, AuthModule],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
