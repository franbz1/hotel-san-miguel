import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { IsValidTipoDocConstraint } from 'src/common/validators/IsValidTipoDoc';

export class CreateHuespedSecundarioDto {
  @IsString({ always: true })
  @Validate(IsValidTipoDocConstraint)
  tipo_documento: string;

  @IsString({
    message: 'El numero de documento es obligatorio y debe ser un texto',
  })
  @MinLength(6)
  @MaxLength(20)
  numero_documento: string;

  @IsString({
    message: 'El primer apellido es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  primer_apellido: string;

  @IsString({
    message: 'El segundo apellido es opcional y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  segundo_apellido?: string;

  @IsString({
    message: 'Los nombres son obligatorios y deben ser un texto',
  })
  @MinLength(2)
  @MaxLength(100)
  nombres: string;

  @IsString({
    message: 'El pais de residencia es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  pais_residencia: string;

  @IsString({
    message: 'El departamento de residencia es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  departamento_residencia: string;

  @IsString({
    message: 'La ciudad de residencia es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_residencia: string;

  @IsString({
    message: 'El lugar de nacimiento es obligatorio y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  lugar_nacimiento: string;

  @IsDate({
    message: 'La fecha de nacimiento es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_nacimiento: Date;

  @IsString({
    message: 'La nacionalidad es obligatoria y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  nacionalidad: string;

  @IsString({
    message: 'La ocupacion es obligatoria y debe ser un texto',
  })
  @MinLength(2)
  @MaxLength(50)
  ocupacion: string;

  @IsString({
    message: 'El genero es obligatorio y debe ser MASCULINO, FEMENINO u OTRO',
  })
  @MinLength(4)
  @MaxLength(9)
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';

  @IsString({
    message: 'El telefono es opcional y debe ser un texto',
  })
  telefono: string;

  @IsString({
    message: 'El correo es opcional y debe ser un correo',
  })
  correo: string;

  @IsInt({
    message: 'El huespedId es obligatorio y debe ser un numero entero',
  })
  @Min(1)
  @Type(() => Number)
  huespedId: number;
}
