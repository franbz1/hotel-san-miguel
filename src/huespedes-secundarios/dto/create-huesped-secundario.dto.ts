import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, TipoDocumento } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Genero } from 'src/common/enums/generos.enum';
import { TipoDoc } from 'src/common/enums/tipoDoc.enum';

export class CreateHuespedSecundarioDto {
  @ApiProperty({
    description:
      'Tipo de documento del huésped secundario. Debe ser uno de los valores definidos en el enum.',
    enum: TipoDoc,
    example: TipoDoc.CC, // Ajusta el ejemplo según corresponda
  })
  @IsEnum(TipoDoc, {
    message: `El tipo de documento es obligatorio y debe ser uno de los siguientes: ${Object.values(
      TipoDoc,
    ).join(', ')}`,
  })
  tipo_documento: TipoDoc | TipoDocumento;

  @ApiProperty({
    description: 'Número de documento del huésped secundario',
    example: '12345678',
  })
  @IsString({
    message: 'El numero de documento es obligatorio y debe ser un texto',
  })
  @MinLength(6)
  @MaxLength(20)
  numero_documento: string;

  @ApiProperty({
    description: 'Primer apellido del huésped secundario',
    example: 'Pérez',
  })
  @IsString({
    message: 'El primer apellido es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  primer_apellido: string;

  @ApiPropertyOptional({
    description: 'Segundo apellido del huésped secundario (opcional)',
    example: 'García',
  })
  @IsString({
    message: 'El segundo apellido es opcional y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  segundo_apellido?: string;

  @ApiProperty({
    description: 'Nombres del huésped secundario',
    example: 'Juan Carlos',
  })
  @IsString({
    message: 'Los nombres son obligatorios y deben ser un texto',
  })
  @MinLength(2)
  @MaxLength(100)
  nombres: string;

  @ApiProperty({
    description: 'País de residencia del huésped secundario',
    example: 'Colombia',
  })
  @IsString({
    message: 'El pais de residencia es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  pais_residencia: string;

  @ApiProperty({
    description: 'Departamento de residencia del huésped secundario',
    example: 'Antioquia',
  })
  @IsString({
    message: 'El departamento de residencia es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  departamento_residencia: string;

  @ApiProperty({
    description: 'Ciudad de residencia del huésped secundario',
    example: 'Medellín',
  })
  @IsString({
    message: 'La ciudad de residencia es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_residencia: string;

  @ApiProperty({
    description: 'Ciudad de procedencia del huésped secundario',
    example: 'Bogotá',
  })
  @IsString({
    message: 'La ciudad de procedencia es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_procedencia: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del huésped secundario',
    example: '1990-01-01T00:00:00.000Z',
  })
  @IsDate({
    message: 'La fecha de nacimiento es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Nacionalidad del huésped secundario',
    example: 'Colombiano',
  })
  @IsString({
    message: 'La nacionalidad es obligatoria y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  nacionalidad: string;

  @ApiProperty({
    description: 'Ocupación del huésped secundario',
    example: 'Estudiante',
  })
  @IsString({
    message: 'La ocupacion es obligatoria y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  ocupacion: string;

  @ApiProperty({
    description:
      'Género del huésped secundario. Debe ser uno de los valores definidos en el enum.',
    enum: Genero,
    example: Genero.MASCULINO,
  })
  @IsEnum(Genero, {
    message: `El genero es obligatorio y debe ser uno de los siguientes: ${Object.values(
      Genero,
    ).join(', ')}`,
  })
  genero: Genero | $Enums.Genero;

  @ApiPropertyOptional({
    description: 'Teléfono del huésped secundario (opcional)',
    example: '+573001112233',
  })
  @IsString({
    message: 'El telefono es opcional y debe ser un texto',
  })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo del huésped secundario (opcional)',
    example: 'correo@example.com',
  })
  @IsString({
    message: 'El correo es opcional y debe ser un correo',
  })
  @IsOptional()
  correo?: string;

  @ApiProperty({
    description: 'Identificador del huésped al que pertenece',
    example: 1,
  })
  @IsInt({
    message: 'El huespedId es obligatorio y debe ser un numero entero',
  })
  @Min(1)
  @Type(() => Number)
  huespedId: number;
}
