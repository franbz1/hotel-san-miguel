import { Module, Logger } from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { HabitacionesController } from './habitaciones.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [HabitacionesController],
  providers: [HabitacionesService, Logger],
  imports: [PrismaModule, AuthModule, ScheduleModule.forRoot()],
  exports: [HabitacionesService],
})
export class HabitacionesModule {}
