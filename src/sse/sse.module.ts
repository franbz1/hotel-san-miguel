import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { HabitacionSseService } from './habitacionSse.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [SseController],
  providers: [HabitacionSseService],
  imports: [AuthModule, PrismaModule],
  exports: [HabitacionSseService],
})
export class SseModule {}
