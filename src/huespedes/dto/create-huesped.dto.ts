import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TipoDoc } from '../../common/enums/tipoDoc.enum';
import { Genero } from 'src/common/enums/generos.enum';

export class CreateHuespedDto {
  @ApiProperty({
    description: 'Tipo de documento del huésped',
    enum: TipoDoc,
    example: TipoDoc.CC, // Ajusta el ejemplo de acuerdo a los valores del enum
  })
  @IsEnum(TipoDoc, {
    message: `El tipo de documento es obligatorio y debe ser uno de los siguientes: ${Object.values(
      TipoDoc,
    ).join(', ')}`,
    always: true,
  })
  tipo_documento: TipoDoc;

  @ApiProperty({
    description: 'Número de documento del huésped',
    example: '123456789',
  })
  @IsString({
    message: 'El número de documento es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(6)
  @MaxLength(20)
  numero_documento: string;

  @ApiProperty({
    description: 'Primer apellido del huésped',
    example: 'Pérez',
  })
  @IsString({
    message: 'El primer apellido es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  primer_apellido: string;

  @ApiPropertyOptional({
    description: 'Segundo apellido del huésped (opcional)',
    example: 'García',
  })
  @IsString({
    message: 'El segundo apellido debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  segundo_apellido?: string;

  @ApiProperty({
    description: 'Nombres del huésped',
    example: 'Juan Carlos',
  })
  @IsString({
    message: 'Los nombres son obligatorios y deben ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(100)
  nombres: string;

  @ApiProperty({
    description: 'País de residencia del huésped',
    example: 'Colombia',
  })
  @IsString({
    message: 'El país de residencia es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  pais_residencia: string;

  @ApiProperty({
    description: 'Ciudad de residencia del huésped',
    example: 'Medellín',
  })
  @IsString({
    message: 'La ciudad de residencia es obligatoria y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_residencia: string;

  @ApiProperty({
    description: 'País de procedencia del huésped',
    example: 'Colombia',
  })
  @IsString({
    message: 'El país de procedencia es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  pais_procedencia: string;

  @ApiProperty({
    description: 'Ciudad de procedencia del huésped',
    example: 'Medellín',
  })
  @IsString({
    message: 'La ciudad de procedencia es obligatoria y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_procedencia: string;

  @ApiProperty({
    description: 'Lugar de nacimiento del huésped',
    example: 'Bogotá',
  })
  @IsString({
    message: 'El lugar de nacimiento es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  lugar_nacimiento: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del huésped',
    example: '1990-01-01T00:00:00.000Z',
  })
  @IsDate({
    message: 'La fecha de nacimiento es obligatoria y debe ser una fecha',
    always: true,
  })
  @Type(() => Date)
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Nacionalidad del huésped',
    example: 'Colombiano',
  })
  @IsString({
    message: 'La nacionalidad es obligatoria y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  nacionalidad: string;

  @ApiProperty({
    description: 'Ocupación del huésped',
    example: 'Ingeniero',
  })
  @IsString({
    message: 'La ocupación es obligatoria y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  ocupacion: string;

  @ApiProperty({
    description: 'Género del huésped',
    enum: Genero,
    example: Genero.MASCULINO, // Ajusta según los valores definidos en el enum Genero
  })
  @IsEnum(Genero, {
    message: `El género es obligatorio y debe ser uno de los siguientes: ${Object.values(
      Genero,
    ).join(', ')}`,
    always: true,
  })
  genero: Genero;

  @ApiPropertyOptional({
    description: 'Teléfono del huésped',
    example: '+573001112233',
  })
  @IsPhoneNumber()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del huésped',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'El correo es opcional y debe ser un correo válido' })
  @IsOptional()
  correo?: string;
}
