import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Genero } from 'src/common/enums/generos.enum';
import { TipoDoc } from 'src/common/enums/tipoDoc.enum';
import { CreateHuespedSecundarioWithoutIdDto } from './CreateHuespedSecundarioWithoutIdDto';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';

export class CreateRegistroFormularioDto {
  //Datos de la reserva
  @IsDate()
  @Type(() => Date)
  fecha_inicio: Date;

  @IsDate()
  @Type(() => Date)
  fecha_fin: Date;

  @IsEnum(MotivosViajes)
  motivo_viaje: MotivosViajes;

  @IsPositive()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  costo: number;

  @IsPositive()
  @Type(() => Number)
  habitacionId: number;

  @IsPositive()
  @Type(() => Number)
  numero_acompaniantes: number;
  //Fin de datos de la reserva

  //Datos del Huesped
  @IsEnum(TipoDoc)
  tipo_documento: TipoDoc;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  numero_documento: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  primer_apellido: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  segundo_apellido?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombres: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  pais_residencia: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  departamento_residencia: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ciudad_residencia: string;

  @IsDate()
  @Type(() => Date)
  fecha_nacimiento: Date;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nacionalidad: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ocupacion: string;

  @IsEnum(Genero)
  genero: Genero;

  @IsPhoneNumber()
  telefono?: string;

  @IsEmail()
  correo?: string;
  //Fin de datos del Huesped

  //Datos de huespedes secundarios
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHuespedSecundarioWithoutIdDto)
  huespedes_secundarios?: CreateHuespedSecundarioWithoutIdDto[];
}
