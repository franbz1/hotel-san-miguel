import { PartialType } from '@nestjs/mapped-types';
import { CreateHabitacionDto } from './create-habitacion.dto';

export class UpdateHabitacionDto extends PartialType(CreateHabitacionDto) {}
