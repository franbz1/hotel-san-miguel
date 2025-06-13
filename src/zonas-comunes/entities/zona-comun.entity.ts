import { ApiProperty } from '@nestjs/swagger';
import { TiposAseo } from './tipos-aseo.enum';

/**
 * Zona común del hotel que requiere aseo
 */
export class ZonaComun {
  @ApiProperty({
    description: 'ID único de la zona común',
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
  })
  public requerido_aseo_hoy: boolean;

  @ApiProperty({
    description: 'Fecha del último aseo realizado en la zona común',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  public ultimo_aseo_fecha: Date | null;

  @ApiProperty({
    description: 'Tipo del último aseo realizado en la zona común',
    enum: TiposAseo,
    example: TiposAseo.LIMPIEZA,
    nullable: true,
  })
  public ultimo_aseo_tipo: TiposAseo | null;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T10:30:00Z',
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2024-01-15T10:30:00Z',
  })
  public updatedAt: Date;

  @ApiProperty({
    description: 'Indica si la zona común ha sido eliminada (soft delete)',
    example: false,
    default: false,
  })
  public deleted: boolean;
}
