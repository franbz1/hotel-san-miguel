import { ApiProperty } from '@nestjs/swagger';
import { Huesped } from 'src/huespedes/entities/huesped.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

export class Factura {
  @ApiProperty({
    description: 'Identificador único de la factura',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Total de la factura',
    example: 150.75,
    type: 'number',
  })
  total: number;

  @ApiProperty({
    description: 'Fecha de la factura',
    example: '2023-08-15T00:00:00.000Z',
    type: Date,
  })
  fecha_factura: Date;

  @ApiProperty({
    description: 'Identificador del huésped asociado a la factura',
    example: 1,
  })
  huespedId: number;

  @ApiProperty({
    description: 'Reserva asociada a la factura (opcional)',
    type: () => Reserva,
    required: false,
  })
  reserva?: Reserva;

  @ApiProperty({
    description: 'Huésped asociado a la factura',
    type: () => Huesped,
  })
  huesped: Huesped;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2023-01-02T00:00:00.000Z',
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indica si el registro ha sido eliminado (soft delete)',
    example: false,
    default: false,
  })
  deleted: boolean;
}
