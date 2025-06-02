import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';
import { Factura } from 'src/facturas/entities/factura.entity';
import { Formulario } from 'src/formularios/entities/formulario.entity';
import { Habitacion } from 'src/habitaciones/entities/habitacion.entity';
import { HuespedSecundario } from 'src/huespedes-secundarios/entities/huesped-secundario.entity';
import { Huesped } from 'src/huespedes/entities/huesped.entity';

export class Reserva {
  @ApiProperty({
    description: 'Identificador único de la reserva',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Fecha de inicio de la reserva',
    example: '2023-08-15T00:00:00.000Z',
    type: Date,
  })
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la reserva',
    example: '2023-08-20T00:00:00.000Z',
    type: Date,
  })
  fecha_fin: Date;

  @ApiProperty({
    description: 'Estado de la reserva',
    enum: EstadosReserva,
    example: EstadosReserva.RESERVADO,
  })
  estado: EstadosReserva;

  @ApiProperty({
    description: 'País de procedencia de la reserva',
    example: 'Colombia',
  })
  pais_procedencia: string;

  @ApiProperty({
    description: 'Departamento de procedencia de la reserva',
    example: 'Antioquia',
  })
  departamento_procedencia: string;

  @ApiProperty({
    description: 'Ciudad de procedencia de la reserva',
    example: 'Medellín',
  })
  ciudad_procedencia: string;

  @ApiProperty({
    description: 'País de destino de la reserva',
    example: 'Estados Unidos',
  })
  pais_destino: string;

  @ApiProperty({
    description: 'Motivo del viaje',
    enum: MotivosViajes,
    example: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
  })
  motivo_viaje: MotivosViajes;

  @ApiProperty({
    description: 'Fecha de check-in (llegada)',
    example: '2023-08-15T14:00:00.000Z',
    type: Date,
  })
  check_in: Date;

  @ApiProperty({
    description: 'Fecha de check-out (salida)',
    example: '2023-08-20T12:00:00.000Z',
    type: Date,
  })
  check_out: Date;

  @ApiProperty({
    description: 'Costo de la reserva',
    example: 500.5,
    type: 'number',
  })
  costo: number;

  @ApiProperty({
    description: 'Número de acompañantes',
    example: 2,
  })
  numero_acompaniantes: number;

  @ApiProperty({
    description: 'ID de la habitación asignada a la reserva',
    example: 101,
  })
  habitacionId: number;

  @ApiProperty({
    description: 'ID del huésped que realiza la reserva',
    example: 1,
  })
  huespedId: number;

  @ApiProperty({
    description: 'Lista de huéspedes secundarios asociados a la reserva',
    example: [],
    type: () => [HuespedSecundario],
  })
  huespedes_secundarios: HuespedSecundario[];

  @ApiPropertyOptional({
    description: 'ID de la factura asociada a la reserva (opcional)',
    example: 1,
  })
  facturaId?: number;

  @ApiProperty({
    description: 'Huésped que realiza la reserva',
    type: () => Huesped,
  })
  huesped: Huesped;

  @ApiProperty({
    description: 'Habitación asignada a la reserva',
    type: () => Habitacion,
  })
  habitacion: Habitacion;

  @ApiPropertyOptional({
    description: 'Factura asociada a la reserva (opcional)',
    type: () => Factura,
    required: false,
  })
  factura?: Factura;

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

  @ApiProperty({
    description: 'Lista de formularios asociados a la reserva',
    example: [],
    type: () => [Formulario],
  })
  Formulario: Formulario[];
}
