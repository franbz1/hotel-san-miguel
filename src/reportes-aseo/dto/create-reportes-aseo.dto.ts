import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsString,
  IsOptional,
  ArrayNotEmpty,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateReportesAseoDto {
  @ApiProperty({
    description: 'Fecha del reporte diario',
    example: '2024-01-15T00:00:00Z',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha del reporte debe tener un formato válido',
    },
  )
  public fecha: string;

  @ApiProperty({
    description: 'Elementos de aseo utilizados durante el día',
    example: ['Escoba', 'Trapeador', 'Aspiradora', 'Paños de limpieza'],
    type: [String],
  })
  @IsArray({
    message: 'Los elementos de aseo deben ser un array',
  })
  @ArrayNotEmpty({
    message: 'Debe especificar al menos un elemento de aseo',
  })
  @IsString({
    each: true,
    message: 'Cada elemento de aseo debe ser un texto',
  })
  @MinLength(2, {
    each: true,
    message: 'Cada elemento de aseo debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    each: true,
    message: 'Cada elemento de aseo no puede tener más de 100 caracteres',
  })
  public elementos_aseo: string[];

  @ApiProperty({
    description: 'Elementos de protección personal utilizados',
    example: ['Guantes de látex', 'Mascarilla N95', 'Delantal impermeable'],
    type: [String],
  })
  @IsArray({
    message: 'Los elementos de protección deben ser un array',
  })
  @ArrayNotEmpty({
    message: 'Debe especificar al menos un elemento de protección',
  })
  @IsString({
    each: true,
    message: 'Cada elemento de protección debe ser un texto',
  })
  @MinLength(2, {
    each: true,
    message: 'Cada elemento de protección debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    each: true,
    message: 'Cada elemento de protección no puede tener más de 100 caracteres',
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
  @IsArray({
    message: 'Los productos químicos deben ser un array',
  })
  @ArrayNotEmpty({
    message: 'Debe especificar al menos un producto químico',
  })
  @IsString({
    each: true,
    message: 'Cada producto químico debe ser un texto',
  })
  @MinLength(2, {
    each: true,
    message: 'Cada producto químico debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    each: true,
    message: 'Cada producto químico no puede tener más de 100 caracteres',
  })
  public productos_quimicos: string[];

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para el aseo de habitaciones',
    example:
      'Ventilación, retiro de ropa de cama, limpieza de superficies, aspirado, trapeado',
  })
  @IsString({
    message: 'El procedimiento de aseo de habitación debe ser un texto',
  })
  @MinLength(10, {
    message:
      'El procedimiento de aseo de habitación debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de aseo de habitación no puede tener más de 1000 caracteres',
  })
  public procedimiento_aseo_habitacion: string;

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para la desinfección de habitaciones',
    example:
      'Aplicación de desinfectante en todas las superficies, tiempo de contacto 10 minutos',
  })
  @IsString({
    message: 'El procedimiento de desinfección de habitación debe ser un texto',
  })
  @MinLength(10, {
    message:
      'El procedimiento de desinfección de habitación debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de desinfección de habitación no puede tener más de 1000 caracteres',
  })
  public procedimiento_desinfeccion_habitacion: string;

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para la limpieza de zonas comunes',
    example: 'Barrido, trapeado con desinfectante, limpieza de mobiliario',
  })
  @IsString({
    message: 'El procedimiento de limpieza de zona común debe ser un texto',
  })
  @MinLength(10, {
    message:
      'El procedimiento de limpieza de zona común debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de limpieza de zona común no puede tener más de 1000 caracteres',
  })
  public procedimiento_limpieza_zona_comun: string;

  @ApiProperty({
    description:
      'Procedimiento estándar utilizado para la desinfección de zonas comunes',
    example: 'Nebulización con desinfectante, ventilación, secado natural',
  })
  @IsString({
    message: 'El procedimiento de desinfección de zona común debe ser un texto',
  })
  @MinLength(10, {
    message:
      'El procedimiento de desinfección de zona común debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de desinfección de zona común no puede tener más de 1000 caracteres',
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
  @IsObject({
    message: 'Los datos del reporte deben ser un objeto JSON válido',
  })
  @IsOptional()
  public datos?: {
    habitaciones: any[];
    zonas_comunes: any[];
    resumen: {
      total_habitaciones_aseadas: number;
      total_zonas_comunes_aseadas: number;
      objetos_perdidos_encontrados: number;
      rastros_animales_encontrados: number;
    };
  };
}
