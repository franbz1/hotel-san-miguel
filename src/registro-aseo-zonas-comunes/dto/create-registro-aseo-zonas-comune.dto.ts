import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  ArrayNotEmpty,
  ArrayMinSize,
  MaxLength,
  Min,
} from 'class-validator';
import { TiposAseo } from 'src/common/enums/tipos-aseo.enum';

export class CreateRegistroAseoZonaComunDto {
  @ApiProperty({
    description: 'ID del usuario que realiza el aseo',
    example: 1,
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
  public usuarioId: number;

  @ApiProperty({
    description: 'ID de la zona común donde se realiza el aseo',
    example: 1,
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
  public zonaComunId: number;

  @ApiProperty({
    description: 'Fecha y hora en que se registra el aseo',
    example: '2024-01-15T14:30:00Z',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha de registro debe tener un formato válido',
    },
  )
  public fecha_registro: string;

  @ApiProperty({
    description: `Tipos de aseo realizados en la zona común. Debe ser uno o más de los siguientes: ${Object.values(
      TiposAseo,
    ).join(', ')}`,
    enum: TiposAseo,
    isArray: true,
    example: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
  })
  @IsArray({
    message: 'Los tipos realizados deben ser un array',
  })
  @ArrayNotEmpty({
    message: 'Debe especificar al menos un tipo de aseo realizado',
  })
  @ArrayMinSize(1, {
    message: 'Debe especificar al menos un tipo de aseo realizado',
  })
  @IsEnum(TiposAseo, {
    each: true,
    message: `Cada tipo de aseo debe ser uno de los siguientes: ${Object.values(
      TiposAseo,
    ).join(', ')}`,
  })
  public tipos_realizados: TiposAseo[];

  @ApiProperty({
    description: 'Indica si se encontraron objetos perdidos durante el aseo',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean({
    message: 'Objetos perdidos debe ser verdadero o falso',
  })
  @IsOptional()
  public objetos_perdidos?: boolean;

  @ApiProperty({
    description: 'Indica si se encontraron rastros de animales durante el aseo',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean({
    message: 'Rastros de animales debe ser verdadero o falso',
  })
  @IsOptional()
  public rastros_de_animales?: boolean;

  @ApiProperty({
    description: 'Observaciones adicionales sobre el aseo realizado',
    example: 'Zona común en excelente estado, sin incidencias',
    required: false,
  })
  @IsString({
    message: 'Las observaciones deben ser un texto',
  })
  @MaxLength(1000, {
    message: 'Las observaciones no pueden tener más de 1000 caracteres',
  })
  @IsOptional()
  public observaciones?: string;
}
