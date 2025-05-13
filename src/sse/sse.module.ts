import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { HabitacionSseService } from './habitacionSse.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ReservaSseService } from './reservasSse.service';

@Module({
  controllers: [SseController],
  providers: [HabitacionSseService, ReservaSseService],
  imports: [AuthModule, PrismaModule],
  exports: [HabitacionSseService, ReservaSseService],
})
export class SseModule {}
