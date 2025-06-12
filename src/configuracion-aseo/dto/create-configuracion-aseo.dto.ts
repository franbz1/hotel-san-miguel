import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEmail,
  IsArray,
  IsOptional,
  Min,
  Max,
  Matches,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';

export class CreateConfiguracionAseoDto {
  @ApiProperty({
    description: 'Hora límite para completar las tareas de aseo diarias',
    example: '17:00',
    default: '17:00',
  })
  @IsString({
    message: 'La hora límite debe ser un texto',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora límite debe tener formato HH:MM (24 horas)',
  })
  @IsOptional()
  public hora_limite_aseo?: string;

  @ApiProperty({
    description: 'Frecuencia de rotación de colchones en días',
    example: 180,
    default: 180,
  })
  @IsNumber(
    {},
    {
      message: 'La frecuencia de rotación debe ser un número',
    },
  )
  @Min(1, {
    message: 'La frecuencia de rotación debe ser mayor a 0 días',
  })
  @Max(365, {
    message: 'La frecuencia de rotación no puede ser mayor a 365 días',
  })
  @IsOptional()
  public frecuencia_rotacion_colchones?: number;

  @ApiProperty({
    description: 'Días de aviso antes de la rotación de colchones',
    example: 5,
    default: 5,
  })
  @IsNumber(
    {},
    {
      message: 'Los días de aviso deben ser un número',
    },
  )
  @Min(1, {
    message: 'Los días de aviso deben ser mayor a 0',
  })
  @Max(30, {
    message: 'Los días de aviso no pueden ser mayor a 30',
  })
  @IsOptional()
  public dias_aviso_rotacion_colchones?: number;

  @ApiProperty({
    description: 'Indica si las notificaciones están habilitadas',
    example: false,
    default: false,
  })
  @IsBoolean({
    message: 'Habilitar notificaciones debe ser verdadero o falso',
  })
  @IsOptional()
  public habilitar_notificaciones?: boolean;

  @ApiProperty({
    description: 'Email para enviar notificaciones de aseo',
    example: 'admin@hotel.com',
    required: false,
  })
  @IsEmail(
    {},
    {
      message: 'El email de notificaciones debe tener un formato válido',
    },
  )
  @IsOptional()
  public email_notificaciones?: string;

  @ApiProperty({
    description: 'Lista de elementos de aseo por defecto',
    example: ['Escoba', 'Trapeador', 'Detergente'],
    type: [String],
    default: [],
  })
  @IsArray({
    message: 'Los elementos de aseo deben ser una lista',
  })
  @IsString({
    each: true,
    message: 'Cada elemento de aseo debe ser un texto',
  })
  @ArrayMaxSize(50, {
    message: 'No se pueden agregar más de 50 elementos de aseo',
  })
  @MaxLength(100, {
    each: true,
    message: 'Cada elemento de aseo no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public elementos_aseo_default?: string[];

  @ApiProperty({
    description: 'Lista de elementos de protección por defecto',
    example: ['Guantes', 'Mascarilla'],
    type: [String],
    default: [],
  })
  @IsArray({
    message: 'Los elementos de protección deben ser una lista',
  })
  @IsString({
    each: true,
    message: 'Cada elemento de protección debe ser un texto',
  })
  @ArrayMaxSize(50, {
    message: 'No se pueden agregar más de 50 elementos de protección',
  })
  @MaxLength(100, {
    each: true,
    message: 'Cada elemento de protección no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public elementos_proteccion_default?: string[];

  @ApiProperty({
    description: 'Lista de productos químicos por defecto',
    example: ['Desinfectante', 'Limpiador multiusos'],
    type: [String],
    default: [],
  })
  @IsArray({
    message: 'Los productos químicos deben ser una lista',
  })
  @IsString({
    each: true,
    message: 'Cada producto químico debe ser un texto',
  })
  @ArrayMaxSize(50, {
    message: 'No se pueden agregar más de 50 productos químicos',
  })
  @MaxLength(100, {
    each: true,
    message: 'Cada producto químico no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public productos_quimicos_default?: string[];

  @ApiProperty({
    description: 'Áreas a intervenir en habitaciones por defecto',
    example: ['Cama', 'Baño', 'Piso', 'Ventanas'],
    type: [String],
    default: [],
  })
  @IsArray({
    message: 'Las áreas a intervenir en habitaciones deben ser una lista',
  })
  @IsString({
    each: true,
    message: 'Cada área a intervenir en habitaciones debe ser un texto',
  })
  @ArrayMaxSize(50, {
    message:
      'No se pueden agregar más de 50 áreas a intervenir en habitaciones',
  })
  @MaxLength(100, {
    each: true,
    message:
      'Cada área a intervenir en habitaciones no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public areas_intervenir_habitacion_default?: string[];

  @ApiProperty({
    description: 'Áreas a intervenir en baños por defecto',
    example: ['Inodoro', 'Lavamanos', 'Ducha', 'Espejo'],
    type: [String],
    default: [],
  })
  @IsArray({
    message: 'Las áreas a intervenir en baños deben ser una lista',
  })
  @IsString({
    each: true,
    message: 'Cada área a intervenir en baños debe ser un texto',
  })
  @ArrayMaxSize(50, {
    message: 'No se pueden agregar más de 50 áreas a intervenir en baños',
  })
  @MaxLength(100, {
    each: true,
    message:
      'Cada área a intervenir en baños no puede tener más de 100 caracteres',
  })
  @IsOptional()
  public areas_intervenir_banio_default?: string[];

  @ApiProperty({
    description: 'Procedimiento de aseo de habitación por defecto',
    example: 'Limpiar superficies, aspirar alfombras, cambiar ropa de cama',
    required: false,
  })
  @IsString({
    message: 'El procedimiento de aseo de habitación debe ser un texto',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de aseo de habitación no puede tener más de 1000 caracteres',
  })
  @IsOptional()
  public procedimiento_aseo_habitacion_default?: string;

  @ApiProperty({
    description: 'Procedimiento de desinfección de habitación por defecto',
    example: 'Aplicar desinfectante en todas las superficies de contacto',
    required: false,
  })
  @IsString({
    message: 'El procedimiento de desinfección de habitación debe ser un texto',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de desinfección de habitación no puede tener más de 1000 caracteres',
  })
  @IsOptional()
  public procedimiento_desinfeccion_habitacion_default?: string;

  @ApiProperty({
    description: 'Procedimiento de rotación de colchones por defecto',
    example: 'Rotar colchón 180 grados y verificar estado',
    required: false,
  })
  @IsString({
    message: 'El procedimiento de rotación de colchones debe ser un texto',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de rotación de colchones no puede tener más de 1000 caracteres',
  })
  @IsOptional()
  public procedimiento_rotacion_colchones_default?: string;

  @ApiProperty({
    description: 'Procedimiento de limpieza de zona común por defecto',
    example: 'Limpiar áreas comunes, aspirar y trapear pisos',
    required: false,
  })
  @IsString({
    message: 'El procedimiento de limpieza de zona común debe ser un texto',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de limpieza de zona común no puede tener más de 1000 caracteres',
  })
  @IsOptional()
  public procedimiento_limieza_zona_comun_default?: string;

  @ApiProperty({
    description: 'Procedimiento de desinfección de zona común por defecto',
    example: 'Desinfectar todas las superficies de contacto común',
    required: false,
  })
  @IsString({
    message: 'El procedimiento de desinfección de zona común debe ser un texto',
  })
  @MaxLength(1000, {
    message:
      'El procedimiento de desinfección de zona común no puede tener más de 1000 caracteres',
  })
  @IsOptional()
  public procedimiento_desinfeccion_zona_comun_default?: string;
}
