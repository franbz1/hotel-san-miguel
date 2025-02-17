import { PartialType } from '@nestjs/swagger';
import { CreateHabitacionDto } from './create-habitacion.dto';

export class UpdateHabitacionDto extends PartialType(CreateHabitacionDto) {}
