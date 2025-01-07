import { PartialType } from '@nestjs/mapped-types';
import { CreateHuespedSecundarioDto } from './create-huesped-secundario.dto';

export class UpdateHuespedSecundarioDto extends PartialType(
  CreateHuespedSecundarioDto,
) {}
