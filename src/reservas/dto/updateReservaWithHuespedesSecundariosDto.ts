import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateReservaDto } from './create-reserva.dto';
import { CreateHuespedSecundarioDto } from 'src/huespedes-secundarios/dto/create-huesped-secundario.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReservaWithHuespedesSecundariosDto extends PartialType(
  CreateReservaDto,
) {
  @ApiPropertyOptional({
    description: 'Lista de huéspedes secundarios asociados a la reserva',
    type: [CreateHuespedSecundarioDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateHuespedSecundarioDto)
  huespedes_secundarios?: CreateHuespedSecundarioDto[];
}
