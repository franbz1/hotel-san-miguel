import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsValidTipoDocConstraint } from 'src/common/validators/IsValidTipoDoc';

export class CreateHuespedDto {
  //De momento se usara Sqlite como db de desarrollo y no soporta enums por lo cual se usa la validación manual
  @IsString({ always: true })
  @Validate(IsValidTipoDocConstraint)
  tipo_documento: string;

  @IsString({
    message: 'El numero de documento es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(6)
  @MaxLength(20)
  numero_documento: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsDate()
  @Type(() => Date)
  fecha_nacimiento: Date;

  @IsString()
  direccion: string;

  @IsString()
  procedencia: string;

  @IsString()
  destino: string;

  @IsString()
  motivo_viaje: string;

  @IsString()
  @IsEmail()
  correo: string;
}
