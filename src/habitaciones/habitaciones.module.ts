import { Module } from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { HabitacionesController } from './habitaciones.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [HabitacionesController],
  providers: [HabitacionesService],
  imports: [PrismaModule, AuthModule],
  exports: [HabitacionesService],
})
export class HabitacionesModule {}
