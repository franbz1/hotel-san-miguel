import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { TiposAseo } from '../entities/tipos-aseo.enum';

export class CreateZonaComunDto {
  @ApiProperty({
    description:
      'Nombre descriptivo de la zona común. Debe ser único y descriptivo.',
    example: 'Recepción',
  })
  @IsString({
    message: 'El nombre es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2, {
    message: 'El nombre debe tener al menos 2 caracteres',
    always: true,
  })
  @MaxLength(100, {
    message: 'El nombre no puede tener más de 100 caracteres',
    always: true,
  })
  public nombre: string;

  @ApiProperty({
    description:
      'Número del piso donde se encuentra la zona común. Debe ser un número positivo.',
    example: 1,
  })
  @IsNumber(
    {},
    {
      message: 'El piso debe ser un número',
      always: true,
    },
  )
  @Min(0, {
    message: 'El piso debe ser mayor o igual a 0',
    always: true,
  })
  @Max(50, {
    message: 'El piso no puede ser mayor a 50',
    always: true,
  })
  public piso: number;

  @ApiProperty({
    description: 'Indica si la zona común requiere aseo hoy',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean({
    message: 'Requerido aseo hoy debe ser verdadero o falso',
  })
  @IsOptional()
  public requerido_aseo_hoy?: boolean;

  @ApiProperty({
    description: 'Fecha del último aseo realizado en la zona común',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsDateString(
    {},
    {
      message: 'La fecha del último aseo debe tener un formato válido',
    },
  )
  @IsOptional()
  public ultimo_aseo_fecha?: string;

  @ApiProperty({
    description: `Tipo del último aseo realizado en la zona común. Debe ser uno de los siguientes: ${Object.values(
      TiposAseo,
    ).join(', ')}`,
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
  public ultimo_aseo_tipo?: TiposAseo;
}
