import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsValidEstadoReserva } from 'src/common/validators/IsValidEstadoReserva';

export class CreateReservaDto {
  @IsDate({
    message:
      'La fecha de inicio de la reserva es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_inicio: Date;

  @IsDate({
    message:
      'La fecha de fin de la reserva es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_fin: Date;

  @IsString({
    message: 'El estado de la reserva es obligatorio y debe ser una cadena',
  })
  @Validate(IsValidEstadoReserva)
  estado: string;

  @IsString({
    message: 'El pais de la procedencia es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  pais_procedencia: string;

  @IsString({
    message:
      'El departamento de la procedencia es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  departamento_procedencia: string;

  @IsString({
    message: 'El ciudad de la procedencia es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_procedencia: string;

  @IsString({
    message: 'El pais de destino es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  pais_destino: string;

  @IsString({
    message: 'El departamento de destino es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  motivo_viaje: string;

  @IsDate({
    message: 'La fecha de llegada es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  check_in: Date;

  @IsDate({
    message: 'La fecha de salida es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  check_out: Date;

  @IsPositive({
    message: 'El precio es obligatorio y debe ser un número positivo',
  })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Type(() => Number)
  costo: number;

  @IsInt({
    message:
      'El numero de acompañantes es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  numero_acompaniantes: number;

  @IsPositive({
    message:
      'El Id de la habitacion es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  habitacionId: number;

  @IsPositive({
    message: 'El Id del huesped es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  huespedId: number;

  @IsPositive({
    message: 'La factura ID debe ser un numero positivo',
  })
  @Type(() => Number)
  @IsOptional()
  facturaId?: number;
}
