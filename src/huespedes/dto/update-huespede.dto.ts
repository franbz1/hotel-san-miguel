import { PartialType } from '@nestjs/mapped-types';
import { CreateHuespedDto } from './create-huesped.dto';

export class UpdateHuespedeDto extends PartialType(CreateHuespedDto) {}
