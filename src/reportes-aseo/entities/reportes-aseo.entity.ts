import { ApiProperty } from '@nestjs/swagger';
import { RegistroAseoHabitacion } from 'src/registro-aseo-habitaciones/entities/registro-aseo-habitacion.entity';
import { RegistroAseoZonaComun } from 'src/registro-aseo-zonas-comunes/entities/registro-aseo-zonas-comune.entity';

/**
 * Reporte diario unificado de aseo del hotel
 * Contiene todos los registros de aseo de habitaciones y zonas comunes del día
 */
export class ReporteAseoDiario {
  @ApiProperty({
    description: 'ID único del reporte diario de aseo',
    example: 1,
  })
  public id: number;

  @ApiProperty({
    description: 'Fecha del reporte diario',
    example: '2024-01-15T00:00:00Z',
  })
  public fecha: Date;

  @ApiProperty({
    description: 'Elementos de aseo utilizados durante el día',
    example: ['Escoba', 'Trapeador', 'Aspiradora', 'Paños de limpieza'],
    type: [String],
  })
  public elementos_aseo: string[];

  @ApiProperty({
    description: 'Elementos de protección personal utilizados',
    example: ['Guantes de látex', 'Mascarilla N95', 'Delantal impermeable'],
    type: [String],
  })
  public elementos_proteccion: string[];

  @ApiProperty({
    description:
      'Productos químicos utilizados para la limpieza y desinfección',
    example: [
      'Desinfectante multiusos',
      'Detergente líquido',
      'Alcohol al 70%',
    ],
    type: [String],
  })
  public productos_quimicos: string[];

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para el aseo de habitaciones',
    example:
      'Ventilación, retiro de ropa de cama, limpieza de superficies, aspirado, trapeado',
  })
  public procedimiento_aseo_habitacion: string;

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para la desinfección de habitaciones',
    example:
      'Aplicación de desinfectante en todas las superficies, tiempo de contacto 10 minutos',
  })
  public procedimiento_desinfeccion_habitacion: string;

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para la limpieza de zonas comunes',
    example: 'Barrido, trapeado con desinfectante, limpieza de mobiliario',
  })
  public procedimiento_limpieza_zona_comun: string;

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para la desinfección de zonas comunes',
    example: 'Nebulización con desinfectante, ventilación, secado natural',
  })
  public procedimiento_desinfeccion_zona_comun: string;

  @ApiProperty({
    description:
      'Datos completos del reporte en formato JSON incluyendo todos los registros del día. ' +
      'Contiene un array de RegistroAseoHabitacion en "habitaciones" y un array de RegistroAseoZonaComun en "zonas_comunes"',
    example: {
      habitaciones: [
        {
          id: 1,
          habitacionId: 101,
          usuarioId: 1,
          fecha_registro: '2024-01-15T14:30:00Z',
          tipos_realizados: ['LIMPIEZA', 'DESINFECCION'],
          objetos_perdidos: false,
          rastros_de_animales: false,
          observaciones: 'Habitación en buen estado',
        },
      ],
      zonas_comunes: [
        {
          id: 1,
          zonaComunId: 1,
          usuarioId: 1,
          fecha_registro: '2024-01-15T15:00:00Z',
          tipos_realizados: ['LIMPIEZA'],
          objetos_perdidos: false,
          rastros_de_animales: false,
          observaciones: 'Zona común limpia',
        },
      ],
      resumen: {
        total_habitaciones_aseadas: 15,
        total_zonas_comunes_aseadas: 8,
        objetos_perdidos_encontrados: 2,
        rastros_animales_encontrados: 0,
      },
    },
    type: 'object',
    properties: {
      habitaciones: {
        type: 'array',
        items: { $ref: '#/components/schemas/RegistroAseoHabitacion' },
      },
      zonas_comunes: {
        type: 'array',
        items: { $ref: '#/components/schemas/RegistroAseoZonaComun' },
      },
      resumen: {
        type: 'object',
        properties: {
          total_habitaciones_aseadas: { type: 'number' },
          total_zonas_comunes_aseadas: { type: 'number' },
          objetos_perdidos_encontrados: { type: 'number' },
          rastros_animales_encontrados: { type: 'number' },
        },
      },
    },
  })
  public datos: {
    habitaciones: RegistroAseoHabitacion[];
    zonas_comunes: RegistroAseoZonaComun[];
    resumen: {
      total_habitaciones_aseadas: number;
      total_zonas_comunes_aseadas: number;
      objetos_perdidos_encontrados: number;
      rastros_animales_encontrados: number;
    };
  };

  @ApiProperty({
    description: 'Fecha de creación del reporte',
    example: '2024-01-15T18:00:00Z',
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del reporte',
    example: '2024-01-15T18:00:00Z',
  })
  public updatedAt: Date;

  @ApiProperty({
    description: 'Indica si el reporte ha sido eliminado (soft delete)',
    example: false,
    default: false,
  })
  public deleted: boolean;
}
