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
  MinLength,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TiposAseo } from 'src/common/enums/tipos-aseo.enum';

export class CreateRegistroAseoHabitacionDto {
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
    description: 'ID de la habitación donde se realiza el aseo',
    example: 101,
  })
  @IsNumber(
    {},
    {
      message: 'El ID de la habitación debe ser un número',
    },
  )
  @Min(1, {
    message: 'El ID de la habitación debe ser mayor a 0',
  })
  public habitacionId: number;

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
    description:
      'Áreas de la habitación que fueron intervenidas durante el aseo',
    example: ['Cama', 'Escritorio', 'Ventanas', 'Piso'],
    type: [String],
  })
  @IsArray({
    message: 'Las áreas intervenidas deben ser un array',
  })
  @ArrayNotEmpty({
    message: 'Debe especificar al menos un área intervenida',
  })
  @IsString({
    each: true,
    message: 'Cada área intervenida debe ser un texto',
  })
  @MinLength(2, {
    each: true,
    message: 'Cada área intervenida debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    each: true,
    message: 'Cada área intervenida no puede tener más de 100 caracteres',
  })
  public areas_intervenidas: string[];

  @ApiProperty({
    description: 'Áreas del baño que fueron intervenidas durante el aseo',
    example: ['Inodoro', 'Lavamanos', 'Ducha', 'Espejo'],
    type: [String],
  })
  @IsArray({
    message: 'Las áreas del baño intervenidas deben ser un array',
  })
  @ArrayNotEmpty({
    message: 'Debe especificar al menos un área del baño intervenida',
  })
  @IsString({
    each: true,
    message: 'Cada área del baño intervenida debe ser un texto',
  })
  @MinLength(2, {
    each: true,
    message: 'Cada área del baño intervenida debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    each: true,
    message:
      'Cada área del baño intervenida no puede tener más de 100 caracteres',
  })
  public areas_intervenidas_banio: string[];

  @ApiProperty({
    description:
      'Procedimiento específico utilizado para la rotación de colchones',
    example: 'Rotación 180° y volteo del colchón principal',
    required: false,
  })
  @Transform(({ value }) => {
    // Convertir strings vacías a undefined para que @IsOptional funcione correctamente
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== undefined && value !== null)
  @IsString({
    message: 'El procedimiento de rotación de colchones debe ser un texto',
  })
  @MinLength(10, {
    message:
      'El procedimiento de rotación de colchones debe tener al menos 10 caracteres',
  })
  @MaxLength(500, {
    message:
      'El procedimiento de rotación de colchones no puede tener más de 500 caracteres',
  })
  public procedimiento_rotacion_colchones?: string;

  @ApiProperty({
    description: `Tipos de aseo realizados en la habitación. Debe ser uno o más de los siguientes: ${Object.values(
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
    example: 'Habitación en excelente estado, sin incidencias',
    required: false,
  })
  @Transform(({ value }) => {
    // Convertir strings vacías a undefined para que @IsOptional funcione correctamente
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== undefined && value !== null)
  @IsString({
    message: 'Las observaciones deben ser un texto',
  })
  @MinLength(5, {
    message: 'Las observaciones deben tener al menos 5 caracteres',
  })
  @MaxLength(1000, {
    message: 'Las observaciones no pueden tener más de 1000 caracteres',
  })
  public observaciones?: string;
}
