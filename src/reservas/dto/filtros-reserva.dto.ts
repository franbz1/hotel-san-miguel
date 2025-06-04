import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  IsNumber,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';
import { PaginationDto } from 'src/common/dtos/paginationDto';

export class FiltrosReservaDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango de búsqueda (formato ISO)',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  fechaInicioDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango de búsqueda (formato ISO)',
    example: '2024-12-31T23:59:59.999Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  fechaInicioHasta?: string;

  @ApiPropertyOptional({
    description: 'Fecha de check-in desde (formato ISO)',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  checkInDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de check-in hasta (formato ISO)',
    example: '2024-12-31T23:59:59.999Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  checkInHasta?: string;

  @ApiPropertyOptional({
    description: 'Estado de la reserva',
    enum: EstadosReserva,
    example: EstadosReserva.RESERVADO,
  })
  @IsOptional()
  @IsEnum(EstadosReserva)
  estado?: EstadosReserva;

  @ApiPropertyOptional({
    description: 'País de procedencia del huésped',
    example: 'Colombia',
    type: String,
  })
  @IsOptional()
  @IsString()
  paisProcedencia?: string;

  @ApiPropertyOptional({
    description: 'Ciudad de procedencia del huésped',
    example: 'Medellín',
    type: String,
  })
  @IsOptional()
  @IsString()
  ciudadProcedencia?: string;

  @ApiPropertyOptional({
    description: 'Motivo del viaje',
    enum: MotivosViajes,
    example: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
  })
  @IsOptional()
  @IsEnum(MotivosViajes)
  motivoViaje?: MotivosViajes;

  @ApiPropertyOptional({
    description: 'ID de la habitación',
    example: 101,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  habitacionId?: number;

  @ApiPropertyOptional({
    description: 'ID del huésped principal',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  huespedId?: number;

  @ApiPropertyOptional({
    description: 'Costo mínimo de la reserva',
    example: 100.0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoMinimo?: number;

  @ApiPropertyOptional({
    description: 'Costo máximo de la reserva',
    example: 1000.0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoMaximo?: number;

  @ApiPropertyOptional({
    description: 'Número de acompañantes mínimo',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(20)
  acompaniantesMinimo?: number;

  @ApiPropertyOptional({
    description: 'Número de acompañantes máximo',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(20)
  acompaniantesMaximo?: number;

  @ApiPropertyOptional({
    description: 'Ordenar por campo específico',
    example: 'fecha_inicio',
    enum: [
      'fecha_inicio',
      'fecha_fin',
      'check_in',
      'check_out',
      'costo',
      'createdAt',
    ],
  })
  @IsOptional()
  @IsString()
  ordenarPor?:
    | 'fecha_inicio'
    | 'fecha_fin'
    | 'check_in'
    | 'check_out'
    | 'costo'
    | 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  direccionOrden?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Término de búsqueda libre en nombres y apellidos del huésped',
    example: 'Juan Pérez',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  busquedaTexto?: string;
}
