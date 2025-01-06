import { PartialType } from '@nestjs/mapped-types';
import { CreateHuespedDto } from './create-huesped.dto';

export class UpdateHuespedDto extends PartialType(CreateHuespedDto) {}
