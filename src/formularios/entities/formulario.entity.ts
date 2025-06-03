import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Huesped } from 'src/huespedes/entities/huesped.entity';
import { LinkFormulario } from 'src/link-formulario/entities/link-formulario.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

export class Formulario {
  @ApiProperty({
    description: 'Identificador único del formulario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Identificador del huésped asociado al formulario',
    example: 1,
  })
  huespedId: number;

  @ApiProperty({
    description: 'Identificador de la reserva asociada al formulario',
    example: 1,
  })
  reservaId: number;

  @ApiProperty({
    description: 'Indica si el formulario ha sido subido a TRA',
    example: false,
    default: false,
  })
  SubidoATra: boolean;

  @ApiPropertyOptional({
    description: 'Identificador del TRA (opcional)',
    example: 123,
  })
  traId?: number;

  @ApiProperty({
    description: 'Indica si el formulario ha sido subido a SIRE',
    example: false,
    default: false,
  })
  SubidoASire: boolean;

  @ApiPropertyOptional({
    description: 'Link de formulario asociado (opcional)',
    type: () => LinkFormulario,
    required: false,
  })
  LinkFormulario?: LinkFormulario;

  @ApiProperty({
    description: 'Huésped asociado al formulario',
    type: () => Huesped,
  })
  Huesped: Huesped;

  @ApiProperty({
    description: 'Reserva asociada al formulario',
    type: () => Reserva,
  })
  Reserva: Reserva;

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
