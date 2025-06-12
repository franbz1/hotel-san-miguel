import { ApiProperty } from '@nestjs/swagger';
import { TiposAseo } from './tipos-aseo.enum';

/**
 * Zona común del hotel que requiere aseo
 */
export class ZonaComun {
  @ApiProperty({
    description: 'Identificador único de la zona común',
    example: 1,
  })
  public id: number;

  @ApiProperty({
    description: 'Nombre descriptivo de la zona común',
    example: 'Recepción',
  })
  public nombre: string;

  @ApiProperty({
    description: 'Número del piso donde se encuentra la zona común',
    example: 1,
  })
  public piso: number;

  @ApiProperty({
    description: 'Indica si la zona común requiere aseo hoy',
    example: false,
    default: false,
  })
  public requerido_aseo_hoy: boolean;

  @ApiProperty({
    description: 'Fecha del último aseo realizado en la zona común',
    example: '2024-01-15T10:30:00Z',
    type: Date,
    required: false,
  })
  public ultimo_aseo_fecha?: Date;

  @ApiProperty({
    description: 'Tipo del último aseo realizado en la zona común',
    enum: TiposAseo,
    example: TiposAseo.LIMPIEZA,
    required: false,
  })
  public ultimo_aseo_tipo?: TiposAseo;

  @ApiProperty({
    description: 'Fecha de creación de la zona común',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la zona común',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  public updatedAt: Date;

  @ApiProperty({
    description: 'Indica si la zona común ha sido eliminada (soft delete)',
    example: false,
    default: false,
  })
  public deleted: boolean;
}
