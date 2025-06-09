import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TiposHabitacion, MotivosViajes, EstadosReserva } from '@prisma/client';

/**
 * DTO base para filtros de fechas
 */
export class FiltrosDateRangeDto {
  @ApiProperty({
    description: 'Fecha de inicio del rango a consultar',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha de fin del rango a consultar',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

/**
 * DTO para filtros generales de analíticas
 */
export class FiltrosAnalyticsDto extends FiltrosDateRangeDto {
  @ApiProperty({
    description: 'Tipo de habitación a filtrar',
    enum: TiposHabitacion,
    required: false,
    example: TiposHabitacion.SENCILLA,
  })
  @IsOptional()
  @IsEnum(TiposHabitacion)
  tipoHabitacion?: TiposHabitacion;

  @ApiProperty({
    description: 'Lista de nacionalidades a filtrar',
    type: [String],
    required: false,
    example: ['Colombia', 'Venezuela', 'Ecuador'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nacionalidades?: string[];

  @ApiProperty({
    description: 'Lista de países de procedencia a filtrar',
    type: [String],
    required: false,
    example: ['Colombia', 'Venezuela'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paisesProcedencia?: string[];

  @ApiProperty({
    description: 'Motivo de viaje a filtrar',
    enum: MotivosViajes,
    required: false,
    example: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
  })
  @IsOptional()
  @IsEnum(MotivosViajes)
  motivoViaje?: MotivosViajes;

  @ApiProperty({
    description: 'Estado de la reserva a filtrar',
    enum: EstadosReserva,
    required: false,
    example: EstadosReserva.FINALIZADO,
  })
  @IsOptional()
  @IsEnum(EstadosReserva)
  estadoReserva?: EstadosReserva;
}

/**
 * DTO para filtros de ocupación
 */
export class FiltrosOcupacionDto extends FiltrosDateRangeDto {
  @ApiProperty({
    description: 'Agrupar resultados por período (mes, semana, día)',
    example: 'mes',
    required: false,
    enum: ['día', 'semana', 'mes', 'año'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['día', 'semana', 'mes', 'año'])
  agruparPor?: 'día' | 'semana' | 'mes' | 'año';

  @ApiProperty({
    description: 'Tipo de habitación específico',
    enum: TiposHabitacion,
    required: false,
  })
  @IsOptional()
  @IsEnum(TiposHabitacion)
  tipoHabitacion?: TiposHabitacion;
}

/**
 * DTO para parámetros de forecast
 */
export class ForecastParamsDto extends FiltrosDateRangeDto {
  @ApiProperty({
    description: 'Número de períodos hacia adelante a predecir',
    example: 6,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  periodosAdelante: number;

  @ApiProperty({
    description: 'Tipo de período para la predicción',
    example: 'mes',
    enum: ['mes', 'semana'],
  })
  @IsEnum(['mes', 'semana'])
  tipoPeriodo: 'mes' | 'semana';
}

/**
 * DTO para filtros de dashboard ejecutivo
 */
export class FiltrosDashboardDto extends FiltrosDateRangeDto {
  @ApiProperty({
    description: 'Incluir datos de comparación con período anterior',
    example: true,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  incluirComparacion?: boolean;

  @ApiProperty({
    description: 'Número de top mercados emisores a incluir',
    example: 5,
    minimum: 3,
    maximum: 10,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Type(() => Number)
  topMercados?: number;

  @ApiProperty({
    description: 'Agrupar resultados por período (mes, semana, día)',
    example: 'mes',
    required: false,
    enum: ['día', 'semana', 'mes', 'año'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['día', 'semana', 'mes', 'año'])
  agruparPor?: 'día' | 'semana' | 'mes' | 'año';
}

/**
 * DTO para filtros del dashboard financiero
 */
export class FiltrosFinancierosDto extends FiltrosDateRangeDto {
  @ApiProperty({
    description: 'Agrupar resultados por período (mes, semana, día)',
    example: 'mes',
    required: false,
    enum: ['día', 'semana', 'mes', 'año'],
    default: 'mes',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['día', 'semana', 'mes', 'año'])
  agruparPor?: 'día' | 'semana' | 'mes' | 'año';

  @ApiProperty({
    description: 'Incluir comparación con período anterior',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  incluirComparacion?: boolean;
}
