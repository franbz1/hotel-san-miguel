import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty } from 'class-validator';
import { IsDateRangeValid } from './validators/date-range.validator';

export class GetInvoicesRangeDto {
  @ApiProperty({
    description:
      'Fecha de inicio del rango en formato YYYY-MM-DD. Debe ser una fecha válida',
    example: '2024-01-01',
    type: String,
  })
  @IsNotEmpty({
    message: 'La fecha de inicio es obligatoria',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha de inicio debe estar en formato válido (YYYY-MM-DD)',
    },
  )
  @Type(() => String)
  startDate: string;

  @ApiProperty({
    description:
      'Fecha de fin del rango en formato YYYY-MM-DD. Debe ser una fecha válida y mayor o igual a la fecha de inicio',
    example: '2024-01-31',
    type: String,
  })
  @IsNotEmpty({
    message: 'La fecha de fin es obligatoria',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha de fin debe estar en formato válido (YYYY-MM-DD)',
    },
  )
  @IsDateRangeValid()
  @Type(() => String)
  endDate: string;
}
