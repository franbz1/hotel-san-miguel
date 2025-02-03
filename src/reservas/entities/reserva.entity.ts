import { ApiProperty } from '@nestjs/swagger';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';

export class Reserva {
  @ApiProperty({
    description: 'Identificador único de la reserva',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Fecha de inicio de la reserva',
    example: '2023-08-15T00:00:00.000Z',
  })
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la reserva',
    example: '2023-08-20T00:00:00.000Z',
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
    example: 'Vacaciones',
  })
  motivo_viaje: string;

  @ApiProperty({
    description: 'Fecha de check-in (llegada)',
    example: '2023-08-15T14:00:00.000Z',
  })
  check_in: Date;

  @ApiProperty({
    description: 'Fecha de check-out (salida)',
    example: '2023-08-20T12:00:00.000Z',
  })
  check_out: Date;

  @ApiProperty({
    description: 'Costo de la reserva',
    example: 500.5,
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
  habitacion_id: number;

  @ApiProperty({
    description: 'ID del huésped que realiza la reserva',
    example: 1,
  })
  huesped_id: number;

  @ApiProperty({
    description: 'ID de la factura asociada a la reserva',
    example: 1,
  })
  factura_id: number;
}
