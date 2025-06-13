import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TiposAseo } from 'src/zonas-comunes/entities/tipos-aseo.enum';
import { PaginationDto } from 'src/common/dtos/paginationDto';

export class FiltrosRegistroAseoZonaComunDto extends PaginationDto {
  @ApiProperty({
    description: 'Filtrar por ID del usuario que realizó el aseo',
    example: 1,
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'El ID del usuario debe ser un número',
    },
  )
  @Min(1, {
    message: 'El ID del usuario debe ser mayor a 0',
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  public usuarioId?: number;

  @ApiProperty({
    description: 'Filtrar por ID de la zona común',
    example: 1,
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'El ID de la zona común debe ser un número',
    },
  )
  @Min(1, {
    message: 'El ID de la zona común debe ser mayor a 0',
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  public zonaComunId?: number;

  @ApiProperty({
    description:
      'Filtrar por fecha específica de registro (formato: YYYY-MM-DD)',
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
    description: 'Filtrar por tipo de aseo realizado',
    enum: TiposAseo,
    example: TiposAseo.LIMPIEZA,
    required: false,
  })
  @IsEnum(TiposAseo, {
    message: `El tipo de aseo debe ser uno de los siguientes: ${Object.values(
      TiposAseo,
    ).join(', ')}`,
  })
  @IsOptional()
  public tipo_aseo?: TiposAseo;

  @ApiProperty({
    description: 'Filtrar por registros donde se encontraron objetos perdidos',
    example: true,
    required: false,
  })
  @IsBoolean({
    message: 'Objetos perdidos debe ser verdadero o falso',
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  public objetos_perdidos?: boolean;

  @ApiProperty({
    description:
      'Filtrar por registros donde se encontraron rastros de animales',
    example: true,
    required: false,
  })
  @IsBoolean({
    message: 'Rastros de animales debe ser verdadero o falso',
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  public rastros_de_animales?: boolean;
}
