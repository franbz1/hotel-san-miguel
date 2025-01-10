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
import { TipoDoc } from '../entities/tipoDoc.enum';

export class CreateHuespedDto {
  @IsEnum(TipoDoc, {
    message: `El tipo de documento es obligatorio y debe ser uno de los siguientes: ${Object.values(
      TipoDoc,
    ).join(', ')}`,
    always: true,
  })
  tipo_documento: TipoDoc;

  @IsString({
    message: 'El numero de documento es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(6)
  @MaxLength(20)
  numero_documento: string;

  @IsString({
    message: 'El primer apellido es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  primer_apellido: string;

  @IsString({
    message: 'El segundo apellido es opcional y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  segundo_apellido?: string;

  @IsString({
    message: 'Los nombres son obligatorios y deben ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(100)
  nombres: string;

  @IsString({
    message: 'El pais de residencia es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  pais_residencia: string;

  @IsString({
    message: 'El departamento de residencia es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  departamento_residencia: string;

  @IsString({
    message: 'La ciudad de residencia es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_residencia: string;

  @IsString({
    message: 'El lugar de nacimiento es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  lugar_nacimiento: string;

  @IsDate({
    message: 'La fecha de nacimiento es obligatoria y debe ser una fecha',
    always: true,
  })
  @Type(() => Date)
  fecha_nacimiento: Date;

  @IsString({
    message: 'La nacionalidad es obligatoria y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  nacionalidad: string;

  @IsString({
    message: 'La ocupacion es obligatoria y debe ser un texto',
    always: true,
  })
  @MinLength(2)
  @MaxLength(50)
  ocupacion: string;

  @IsString({
    message: 'El genero es obligatorio y debe ser MASCULINO, FEMENINO u OTRO',
    always: true,
  })
  @MinLength(4)
  @MaxLength(9)
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';

  @IsPhoneNumber()
  @IsOptional()
  telefono?: string;

  @IsEmail({}, { message: 'El correo es opcional y debe ser un correo' })
  @IsOptional()
  correo?: string;
}
