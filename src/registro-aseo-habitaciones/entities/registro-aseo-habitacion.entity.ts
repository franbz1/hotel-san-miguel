import { ApiProperty } from '@nestjs/swagger';
import { TiposAseo } from 'src/zonas-comunes/entities/tipos-aseo.enum';

/**
 * Registro de aseo realizado en una habitación específica
 */
export class RegistroAseoHabitacion {
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
    description: 'ID de la habitación donde se realizó el aseo',
    example: 101,
  })
  public habitacionId: number;

  @ApiProperty({
    description: 'Fecha y hora en que se registró el aseo',
    example: '2024-01-15T14:30:00Z',
  })
  public fecha_registro: Date;

  @ApiProperty({
    description:
      'Áreas de la habitación que fueron intervenidas durante el aseo',
    example: ['Cama', 'Escritorio', 'Ventanas', 'Piso'],
    type: [String],
  })
  public areas_intervenidas: string[];

  @ApiProperty({
    description: 'Áreas del baño que fueron intervenidas durante el aseo',
    example: ['Inodoro', 'Lavamanos', 'Ducha', 'Espejo'],
    type: [String],
  })
  public areas_intervenidas_banio: string[];

  @ApiProperty({
    description:
      'Procedimiento específico utilizado para la rotación de colchones',
    example: 'Rotación 180° y volteo del colchón principal',
    nullable: true,
  })
  public procedimiento_rotacion_colchones: string | null;

  @ApiProperty({
    description: 'Tipos de aseo realizados en la habitación',
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
    example: 'Habitación en excelente estado, sin incidencias',
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
