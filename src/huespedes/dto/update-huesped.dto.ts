import { PartialType } from '@nestjs/swagger';
import { CreateHuespedDto } from './create-huesped.dto';

export class UpdateHuespedDto extends PartialType(CreateHuespedDto) {}
