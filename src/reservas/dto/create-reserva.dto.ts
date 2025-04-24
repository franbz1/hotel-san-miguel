import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';

export class CreateReservaDto {
  @ApiProperty({
    description: 'Fecha de inicio de la reserva',
    example: '2023-08-15T00:00:00.000Z',
  })
  @IsDate({
    message:
      'La fecha de inicio de la reserva es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la reserva',
    example: '2023-08-20T00:00:00.000Z',
  })
  @IsDate({
    message:
      'La fecha de fin de la reserva es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_fin: Date;

  @ApiProperty({
    description: 'Estado de la reserva',
    enum: EstadosReserva,
    example: EstadosReserva.RESERVADO,
  })
  @IsEnum(EstadosReserva, {
    message: `El estado de la reserva es obligatorio y debe ser uno de los siguientes: ${Object.values(
      EstadosReserva,
    ).join(', ')}`,
  })
  estado: EstadosReserva;

  @ApiProperty({
    description: 'País de procedencia',
    example: 'Colombia',
  })
  @IsString({
    message: 'El pais de la procedencia es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  pais_procedencia: string;

  @ApiProperty({
    description: 'Ciudad de procedencia',
    example: 'Medellín',
  })
  @IsString({
    message: 'La ciudad de la procedencia es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  ciudad_procedencia: string;

  @ApiProperty({
    description: 'País de destino',
    example: 'Estados Unidos',
  })
  @IsString({
    message: 'El pais de destino es obligatorio y debe ser una cadena',
  })
  @MinLength(2)
  @MaxLength(50)
  pais_destino: string;

  @ApiProperty({
    description: 'Motivo del viaje',
    enum: MotivosViajes,
    example: MotivosViajes.COMPRAS,
  })
  @IsEnum(MotivosViajes, {
    message: `El motivo de viaje es obligatorio y debe ser uno de los siguientes: ${Object.values(
      MotivosViajes,
    ).join(', ')}`,
  })
  motivo_viaje: MotivosViajes;

  @ApiProperty({
    description: 'Fecha de check-in (llegada)',
    example: '2023-08-15T14:00:00.000Z',
  })
  @IsDate({
    message: 'La fecha de llegada es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  check_in: Date;

  @ApiProperty({
    description: 'Fecha de check-out (salida)',
    example: '2023-08-20T12:00:00.000Z',
  })
  @IsDate({
    message: 'La fecha de salida es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  check_out: Date;

  @ApiProperty({
    description: 'Costo de la reserva',
    example: 500.5,
  })
  @IsPositive({
    message: 'El precio es obligatorio y debe ser un número positivo',
  })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Type(() => Number)
  costo: number;

  @ApiProperty({
    description: 'Número de acompañantes',
    example: 2,
  })
  @IsInt({
    message:
      'El numero de acompañantes es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  numero_acompaniantes: number;

  @ApiProperty({
    description: 'ID de la habitación asignada',
    example: 101,
  })
  @IsPositive({
    message:
      'El Id de la habitacion es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  habitacionId: number;

  @ApiProperty({
    description: 'ID del huésped que realiza la reserva',
    example: 1,
  })
  @IsPositive({
    message: 'El Id del huesped es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  huespedId: number;

  @ApiPropertyOptional({
    description: 'ID de la factura asociada a la reserva (opcional)',
    example: 1,
  })
  @IsPositive({
    message: 'La factura ID debe ser un numero positivo',
  })
  @Type(() => Number)
  @IsOptional()
  facturaId?: number;
}
