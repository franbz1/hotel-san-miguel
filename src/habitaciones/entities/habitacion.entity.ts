import { ApiProperty } from '@nestjs/swagger';
import { EstadoHabitacion } from '../../common/enums/estadosHbaitacion.enum';
import { TipoHabitacion } from '../../common/enums/tipoHabitacion.enum';
import { Reserva } from 'src/reservas/entities/reserva.entity';

export class Habitacion {
  @ApiProperty({
    description: 'Identificador único de la habitación',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Número de la habitación (debe ser único)',
    example: 101,
  })
  numero_habitacion: number;

  @ApiProperty({
    description: 'Tipo de habitación',
    enum: TipoHabitacion,
    example: TipoHabitacion.SENCILLA,
  })
  tipo: TipoHabitacion;

  @ApiProperty({
    description: 'Estado actual de la habitación',
    enum: EstadoHabitacion,
    example: EstadoHabitacion.LIBRE,
  })
  estado: EstadoHabitacion;

  @ApiProperty({
    description: 'Precio por noche de la habitación',
    example: 150.5,
    type: 'number',
  })
  precio_por_noche: number;

  @ApiProperty({
    description: 'Reservas asociadas a la habitación',
    type: () => [Reserva],
  })
  reservas: Reserva[];

  @ApiProperty({
    description: 'Fecha de creación de la habitación',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la habitación',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indica si la habitación ha sido eliminada (soft delete)',
    example: false,
    default: false,
  })
  deleted: boolean;
}
