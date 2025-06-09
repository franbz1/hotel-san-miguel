import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class GetMonthlyRevenueDto {
  @ApiProperty({
    description: 'Año a analizar. Debe ser un número entero positivo',
    example: 2024,
    type: Number,
    minimum: 1900,
    maximum: 2100,
  })
  @IsNotEmpty({
    message: 'El año es obligatorio',
  })
  @IsInt({
    message: 'El año debe ser un número entero',
  })
  @Min(1900, {
    message: 'El año debe ser mayor o igual a 1900',
  })
  @Max(2100, {
    message: 'El año debe ser menor o igual a 2100',
  })
  @Type(() => Number)
  year: number;

  @ApiProperty({
    description:
      'Mes a analizar (1-12, donde 1=enero, 12=diciembre). Debe ser un número entero entre 1 y 12',
    example: 1,
    type: Number,
    minimum: 1,
    maximum: 12,
  })
  @IsNotEmpty({
    message: 'El mes es obligatorio',
  })
  @IsInt({
    message: 'El mes debe ser un número entero',
  })
  @Min(1, {
    message: 'El mes debe ser mayor o igual a 1',
  })
  @Max(12, {
    message: 'El mes debe ser menor o igual a 12',
  })
  @Type(() => Number)
  month: number;
}
