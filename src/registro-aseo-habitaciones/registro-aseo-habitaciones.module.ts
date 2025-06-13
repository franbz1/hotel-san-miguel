import { Module } from '@nestjs/common';
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';
import { RegistroAseoHabitacionesController } from './registro-aseo-habitaciones.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RegistroAseoHabitacionesController],
  imports: [PrismaModule, AuthModule],
  providers: [RegistroAseoHabitacionesService],
})
export class RegistroAseoHabitacionesModule {}
