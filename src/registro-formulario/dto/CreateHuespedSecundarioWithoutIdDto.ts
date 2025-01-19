import { OmitType } from '@nestjs/mapped-types';
import { CreateHuespedSecundarioDto } from 'src/huespedes-secundarios/dto/create-huesped-secundario.dto';

export class CreateHuespedSecundarioWithoutIdDto extends OmitType(
  CreateHuespedSecundarioDto,
  ['huespedId'] as const,
) {}
