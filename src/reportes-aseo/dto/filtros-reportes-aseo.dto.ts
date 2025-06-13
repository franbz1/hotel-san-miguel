import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from 'src/common/dtos/paginationDto';

export class FiltrosReportesAseoDto extends PaginationDto {
  @ApiProperty({
    description:
      'Filtrar por fecha específica del reporte (formato: YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @IsDateString(
    {},
    {
      message: 'La fecha debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  @IsOptional()
  public fecha?: string;

  @ApiProperty({
    description:
      'Filtrar por rango de fechas - fecha inicial (formato: YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsDateString(
    {},
    {
      message: 'La fecha inicial debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  @IsOptional()
  public fecha_inicio?: string;

  @ApiProperty({
    description:
      'Filtrar por rango de fechas - fecha final (formato: YYYY-MM-DD)',
    example: '2024-01-31',
    required: false,
  })
  @IsDateString(
    {},
    {
      message: 'La fecha final debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  @IsOptional()
  public fecha_fin?: string;

  @ApiProperty({
    description: 'Filtrar por elemento de aseo específico',
    example: 'Aspiradora',
    required: false,
  })
  @IsString({
    message: 'El elemento de aseo debe ser un texto',
  })
  @MinLength(2, {
    message: 'El elemento de aseo debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'El elemento de aseo no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public elemento_aseo?: string;

  @ApiProperty({
    description: 'Filtrar por producto químico específico',
    example: 'Desinfectante multiusos',
    required: false,
  })
  @IsString({
    message: 'El producto químico debe ser un texto',
  })
  @MinLength(2, {
    message: 'El producto químico debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'El producto químico no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public producto_quimico?: string;

  @ApiProperty({
    description: 'Filtrar por elemento de protección específico',
    example: 'Guantes de látex',
    required: false,
  })
  @IsString({
    message: 'El elemento de protección debe ser un texto',
  })
  @MinLength(2, {
    message: 'El elemento de protección debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'El elemento de protección no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public elemento_proteccion?: string;
}
