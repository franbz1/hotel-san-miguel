import { PartialType } from '@nestjs/mapped-types';
import { CreateReservaDto } from './create-reserva.dto';
import { CreateHuespedSecundarioDto } from 'src/huespedes-secundarios/dto/create-huesped-secundario.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReservaWithHuespedesSecundariosDto extends PartialType(
  CreateReservaDto,
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHuespedSecundarioDto)
  huespedes_secundarios?: CreateHuespedSecundarioDto[];
}
