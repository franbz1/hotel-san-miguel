import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Formulario } from 'src/formularios/entities/formulario.entity';

export class LinkFormulario {
  @ApiProperty({
    description: 'Identificador único del link de formulario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'URL del link de formulario',
    example: 'https://formulario.example.com/abc123',
  })
  url: string;

  @ApiProperty({
    description: 'Indica si el formulario ha sido completado',
    example: false,
    default: false,
  })
  completado: boolean;

  @ApiProperty({
    description: 'Indica si el link ha expirado',
    example: false,
    default: false,
  })
  expirado: boolean;

  @ApiProperty({
    description: 'Fecha y hora de vencimiento del link',
    example: '2024-12-31T23:59:59Z',
    type: Date,
  })
  vencimiento: Date;

  @ApiPropertyOptional({
    description: 'Identificador del formulario asociado (opcional)',
    example: 1,
  })
  formularioId?: number;

  @ApiProperty({
    description: 'Número de habitación asociada',
    example: 101,
  })
  numeroHabitacion: number;

  @ApiProperty({
    description: 'Fecha de inicio de la reserva',
    example: '2024-01-15T00:00:00Z',
    type: Date,
  })
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la reserva',
    example: '2024-01-20T00:00:00Z',
    type: Date,
  })
  fechaFin: Date;

  @ApiProperty({
    description: 'Costo de la reserva',
    example: 500.5,
    type: 'number',
  })
  costo: number;

  @ApiPropertyOptional({
    description: 'Formulario asociado al link (opcional)',
    type: () => Formulario,
    required: false,
  })
  formulario?: Formulario;

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
