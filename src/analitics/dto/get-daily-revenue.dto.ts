import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetDailyRevenueDto {
  @ApiProperty({
    description:
      'Fecha a analizar en formato YYYY-MM-DD. Debe ser una fecha válida',
    example: '2024-01-15',
    type: String,
  })
  @IsNotEmpty({
    message: 'La fecha es obligatoria',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha debe estar en formato válido (YYYY-MM-DD)',
    },
  )
  @Type(() => String)
  date: string;
}
