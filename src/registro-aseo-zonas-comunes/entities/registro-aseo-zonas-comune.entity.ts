import { ApiProperty } from '@nestjs/swagger';
import { TiposAseo } from 'src/zonas-comunes/entities/tipos-aseo.enum';

/**
 * Registro de aseo realizado en una zona común específica
 */
export class RegistroAseoZonaComun {
  @ApiProperty({
    description: 'ID único del registro de aseo',
    example: 1,
  })
  public id: number;

  @ApiProperty({
    description: 'ID del usuario que realizó el aseo',
    example: 1,
  })
  public usuarioId: number;

  @ApiProperty({
    description: 'ID de la zona común donde se realizó el aseo',
    example: 1,
  })
  public zonaComunId: number;

  @ApiProperty({
    description: 'Fecha y hora en que se registró el aseo',
    example: '2024-01-15T14:30:00Z',
  })
  public fecha_registro: Date;

  @ApiProperty({
    description: 'Tipos de aseo realizados en la zona común',
    enum: TiposAseo,
    isArray: true,
    example: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
  })
  public tipos_realizados: TiposAseo[];

  @ApiProperty({
    description: 'Indica si se encontraron objetos perdidos durante el aseo',
    example: false,
    default: false,
  })
  public objetos_perdidos: boolean;

  @ApiProperty({
    description: 'Indica si se encontraron rastros de animales durante el aseo',
    example: false,
    default: false,
  })
  public rastros_de_animales: boolean;

  @ApiProperty({
    description: 'Observaciones adicionales sobre el aseo realizado',
    example: 'Zona común en excelente estado, sin incidencias',
    nullable: true,
  })
  public observaciones: string | null;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T14:30:00Z',
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2024-01-15T14:30:00Z',
  })
  public updatedAt: Date;

  @ApiProperty({
    description: 'Indica si el registro ha sido eliminado (soft delete)',
    example: false,
    default: false,
  })
  public deleted: boolean;
}
