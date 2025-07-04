import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Genero } from 'src/common/enums/generos.enum';
import { TipoDoc } from 'src/common/enums/tipoDoc.enum';
import { CreateHuespedSecundarioWithoutIdDto } from './CreateHuespedSecundarioWithoutIdDto';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';

export class CreateRegistroFormularioDto {
  // Datos de la reserva
  @ApiProperty({
    description: 'Fecha de inicio de la reserva',
    example: '2023-08-15T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la reserva',
    example: '2023-08-20T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  fecha_fin: Date;

  @ApiProperty({
    description: 'Motivo del viaje',
    enum: MotivosViajes,
    example: MotivosViajes.COMPRAS,
  })
  @IsEnum(MotivosViajes)
  motivo_viaje: MotivosViajes;

  @ApiProperty({
    description: 'Costo de la reserva (número positivo con hasta 2 decimales)',
    example: 500.5,
  })
  @IsPositive()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  costo: number;

  @ApiProperty({
    description: 'ID de la habitación asignada a la reserva',
    example: 101,
  })
  @IsPositive()
  @Type(() => Number)
  numero_habitacion: number;

  @ApiProperty({
    description: 'Número de acompañantes en la reserva',
    example: 2,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  numero_acompaniantes: number;
  // Fin de datos de la reserva

  // Datos del Huesped
  @ApiProperty({
    description: 'Tipo de documento del huésped',
    enum: TipoDoc,
    example: TipoDoc.CC,
  })
  @IsEnum(TipoDoc)
  tipo_documento: TipoDoc;

  @ApiProperty({
    description: 'Número de documento del huésped',
    example: '12345678',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  numero_documento: string;

  @ApiProperty({
    description: 'Primer apellido del huésped',
    example: 'Pérez',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  primer_apellido: string;

  @ApiPropertyOptional({
    description: 'Segundo apellido del huésped (opcional)',
    example: 'García',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  segundo_apellido?: string;

  @ApiProperty({
    description: 'Nombres del huésped',
    example: 'Juan Carlos',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombres: string;

  @ApiProperty({
    description: 'País de residencia del huésped',
    example: 'Colombia',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  pais_residencia: string;

  @ApiProperty({
    description: 'Ciudad de residencia del huésped',
    example: 'Medellín',
  })
  @IsString()
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
    description: 'País de destino del huésped',
    example: 'Colombia',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  pais_destino: string;

  @ApiProperty({
    description: 'Ciudad de destino del huésped',
    example: 'Bogotá',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ciudad_destino: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del huésped',
    example: '1990-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Nacionalidad del huésped',
    example: 'Colombiano',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nacionalidad: string;

  @ApiProperty({
    description: 'Ocupación del huésped',
    example: 'Ingeniero',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ocupacion: string;

  @ApiProperty({
    description: 'Género del huésped',
    enum: Genero,
    example: Genero.MASCULINO,
  })
  @IsEnum(Genero)
  genero: Genero;

  @ApiPropertyOptional({
    description: 'Teléfono del huésped (opcional)',
    example: '+573001112233',
  })
  @IsPhoneNumber()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del huésped (opcional)',
    example: 'correo@ejemplo.com',
  })
  @IsEmail()
  @IsOptional()
  correo?: string;
  // Fin de datos del Huesped

  // Datos de huespedes secundarios
  @ApiPropertyOptional({
    description: 'Lista de huespedes secundarios asociados al registro',
    type: [CreateHuespedSecundarioWithoutIdDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateHuespedSecundarioWithoutIdDto)
  huespedes_secundarios?: CreateHuespedSecundarioWithoutIdDto[];
}
