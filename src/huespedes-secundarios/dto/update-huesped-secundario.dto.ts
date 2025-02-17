import { PartialType } from '@nestjs/swagger';
import { CreateHuespedSecundarioDto } from './create-huesped-secundario.dto';

export class UpdateHuespedSecundarioDto extends PartialType(
  CreateHuespedSecundarioDto,
) {}
