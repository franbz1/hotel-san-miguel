import { ApiProperty } from '@nestjs/swagger';

/**
 * Configuración del módulo de aseo del hotel
 */
export class ConfiguracionAseo {
  @ApiProperty({
    description: 'Identificador único de la configuración',
    example: 1,
  })
  public id: number;

  @ApiProperty({
    description: 'Hora límite para completar las tareas de aseo diarias',
    example: '17:00',
    default: '17:00',
  })
  public hora_limite_aseo: string;

  @ApiProperty({
    description:
      'Hora en UTC para ejecutar el proceso nocturno de aseo (formato HH:MM)',
    example: '05:00',
    default: '05:00',
  })
  public hora_proceso_nocturno_utc: string;

  @ApiProperty({
    description: 'Frecuencia de rotación de colchones en días',
    example: 180,
    default: 180,
  })
  public frecuencia_rotacion_colchones: number;

  @ApiProperty({
    description: 'Días de aviso antes de la rotación de colchones',
    example: 5,
    default: 5,
  })
  public dias_aviso_rotacion_colchones: number;

  @ApiProperty({
    description: 'Indica si las notificaciones están habilitadas',
    example: false,
    default: false,
  })
  public habilitar_notificaciones: boolean;

  @ApiProperty({
    description: 'Email para enviar notificaciones de aseo',
    example: 'admin@hotel.com',
    required: false,
  })
  public email_notificaciones?: string;

  @ApiProperty({
    description: 'Lista de elementos de aseo por defecto',
    example: ['Escoba', 'Trapeador', 'Detergente'],
    type: [String],
    default: [],
  })
  public elementos_aseo_default: string[];

  @ApiProperty({
    description: 'Lista de elementos de protección por defecto',
    example: ['Guantes', 'Mascarilla'],
    type: [String],
    default: [],
  })
  public elementos_proteccion_default: string[];

  @ApiProperty({
    description: 'Lista de productos químicos por defecto',
    example: ['Desinfectante', 'Limpiador multiusos'],
    type: [String],
    default: [],
  })
  public productos_quimicos_default: string[];

  @ApiProperty({
    description: 'Áreas a intervenir en habitaciones por defecto',
    example: ['Cama', 'Baño', 'Piso', 'Ventanas'],
    type: [String],
    default: [],
  })
  public areas_intervenir_habitacion_default: string[];

  @ApiProperty({
    description: 'Áreas a intervenir en baños por defecto',
    example: ['Inodoro', 'Lavamanos', 'Ducha', 'Espejo'],
    type: [String],
    default: [],
  })
  public areas_intervenir_banio_default: string[];

  @ApiProperty({
    description: 'Procedimiento de aseo de habitación por defecto',
    example: 'Limpiar superficies, aspirar alfombras, cambiar ropa de cama',
    required: false,
  })
  public procedimiento_aseo_habitacion_default?: string;

  @ApiProperty({
    description: 'Procedimiento de desinfección de habitación por defecto',
    example: 'Aplicar desinfectante en todas las superficies de contacto',
    required: false,
  })
  public procedimiento_desinfeccion_habitacion_default?: string;

  @ApiProperty({
    description: 'Procedimiento de rotación de colchones por defecto',
    example: 'Rotar colchón 180 grados y verificar estado',
    required: false,
  })
  public procedimiento_rotacion_colchones_default?: string;

  @ApiProperty({
    description: 'Procedimiento de limpieza de zona común por defecto',
    example: 'Limpiar áreas comunes, aspirar y trapear pisos',
    required: false,
  })
  public procedimiento_limieza_zona_comun_default?: string;

  @ApiProperty({
    description: 'Procedimiento de desinfección de zona común por defecto',
    example: 'Desinfectar todas las superficies de contacto común',
    required: false,
  })
  public procedimiento_desinfeccion_zona_comun_default?: string;

  @ApiProperty({
    description: 'Fecha de creación de la configuración',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la configuración',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  public updatedAt: Date;
}
