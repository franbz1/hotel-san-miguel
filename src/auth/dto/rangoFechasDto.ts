import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class RangoFechasDto {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiProperty({
    description:
      'Fecha de inicio para la búsqueda de habitaciones disponibles. Se valida solo por día, sin considerar la hora exacta.',
    example: '2025-01-01',
    required: false,
  })
  fechaInicio?: Date = new Date();

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiProperty({
    description:
      'Fecha de fin para la búsqueda de habitaciones disponibles. Se valida solo por día, sin considerar la hora exacta.',
    example: '2025-01-02',
    required: false,
  })
  fechaFin?: Date = new Date(new Date().setDate(new Date().getDate() + 1));
}
