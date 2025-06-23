import { PartialType } from '@nestjs/swagger';
import { CreateRegistroAseoHabitacionDto } from './create-registro-aseo-habitacion.dto';

export class UpdateRegistroAseoHabitacionDto extends PartialType(
  CreateRegistroAseoHabitacionDto,
) {}
