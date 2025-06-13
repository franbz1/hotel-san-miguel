import { Module } from '@nestjs/common';
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';
import { RegistroAseoHabitacionesController } from './registro-aseo-habitaciones.controller';

@Module({
  controllers: [RegistroAseoHabitacionesController],
  providers: [RegistroAseoHabitacionesService],
})
export class RegistroAseoHabitacionesModule {}
