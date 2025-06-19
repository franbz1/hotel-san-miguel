import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TiposAseo, EstadosHabitacion, TiposHabitacion } from '@prisma/client';

export class HabitacionAseoEntity {
  @ApiProperty({
    description: 'ID único de la habitación',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Número de habitación',
    example: 101,
  })
  numero_habitacion: number;

  @ApiProperty({
    description: 'Tipo de habitación',
    enum: TiposHabitacion,
    example: TiposHabitacion.SENCILLA,
  })
  tipo: TiposHabitacion;

  @ApiProperty({
    description: 'Estado actual de la habitación',
    enum: EstadosHabitacion,
    example: EstadosHabitacion.LIBRE,
  })
  estado: EstadosHabitacion;

  @ApiPropertyOptional({
    description: 'Fecha del último aseo realizado',
    type: Date,
    example: '2024-01-15T10:30:00Z',
  })
  ultimo_aseo_fecha?: Date;

  @ApiPropertyOptional({
    description: 'Tipo del último aseo realizado',
    enum: TiposAseo,
    example: TiposAseo.LIMPIEZA,
  })
  ultimo_aseo_tipo?: TiposAseo;

  @ApiPropertyOptional({
    description: 'Fecha de la última rotación de colchones',
    type: Date,
    example: '2024-01-10T08:00:00Z',
  })
  ultima_rotacion_colchones?: Date;

  @ApiPropertyOptional({
    description: 'Fecha programada para la próxima rotación de colchones',
    type: Date,
    example: '2024-07-10T08:00:00Z',
  })
  proxima_rotacion_colchones?: Date;

  @ApiProperty({
    description: 'Indica si la habitación requiere aseo hoy',
    example: false,
  })
  requerido_aseo_hoy: boolean;

  @ApiProperty({
    description: 'Indica si la habitación requiere desinfección hoy',
    example: true,
  })
  requerido_desinfeccion_hoy: boolean;

  @ApiProperty({
    description: 'Indica si la habitación requiere rotación de colchones',
    example: false,
  })
  requerido_rotacion_colchones: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    type: Date,
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    type: Date,
    example: '2024-01-15T12:00:00Z',
  })
  updatedAt: Date;
}
