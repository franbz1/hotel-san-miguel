import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumentoHuespedSecundario } from '@prisma/client';
import { Genero } from 'src/common/enums/generos.enum';
import { TipoDoc } from 'src/common/enums/tipoDoc.enum';
import { Documento } from 'src/documentos/entities/documento.entity';
import { Huesped } from 'src/huespedes/entities/huesped.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

export class HuespedSecundario {
  @ApiProperty({
    description: 'Identificador único del huésped secundario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tipo de documento del huésped secundario',
    enum: TipoDoc,
    example: TipoDoc.CC,
  })
  tipo_documento: TipoDocumentoHuespedSecundario;

  @ApiProperty({
    description: 'Número de documento del huésped secundario (debe ser único)',
    example: '12345678',
  })
  numero_documento: string;

  @ApiProperty({
    description: 'Primer apellido del huésped secundario',
    example: 'Pérez',
  })
  primer_apellido: string;

  @ApiPropertyOptional({
    description: 'Segundo apellido del huésped secundario (opcional)',
    example: 'García',
  })
  segundo_apellido?: string;

  @ApiProperty({
    description: 'Nombres del huésped secundario',
    example: 'Juan Carlos',
  })
  nombres: string;

  @ApiProperty({
    description: 'País de residencia del huésped secundario',
    example: 'Colombia',
  })
  pais_residencia: string;

  @ApiProperty({
    description: 'Ciudad de residencia del huésped secundario',
    example: 'Medellín',
  })
  ciudad_residencia: string;

  @ApiProperty({
    description: 'País de procedencia del huésped secundario',
    example: 'Colombia',
  })
  pais_procedencia: string;

  @ApiProperty({
    description: 'Ciudad de procedencia del huésped secundario',
    example: 'Medellín',
  })
  ciudad_procedencia: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del huésped secundario',
    example: '1990-01-01T00:00:00.000Z',
    type: Date,
  })
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Nacionalidad del huésped secundario',
    example: 'Colombiana',
  })
  nacionalidad: string;

  @ApiProperty({
    description: 'Ocupación del huésped secundario',
    example: 'Estudiante',
  })
  ocupacion: string;

  @ApiProperty({
    description: 'Género del huésped secundario',
    enum: Genero,
    example: Genero.MASCULINO,
  })
  genero: Genero;

  @ApiPropertyOptional({
    description: 'Teléfono del huésped secundario (opcional)',
    example: '+573001112233',
    required: false,
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo del huésped secundario (opcional)',
    example: 'correo@example.com',
    required: false,
  })
  correo?: string;

  @ApiPropertyOptional({
    description:
      'Identificador del huésped principal al que pertenece (opcional)',
    example: 1,
  })
  huespedId?: number;

  @ApiProperty({
    description: 'Huésped principal asociado',
    type: () => Huesped,
  })
  huesped?: Huesped;

  @ApiProperty({
    description: 'Lista de reservas asociadas al huésped secundario',
    example: [],
    type: () => [Reserva],
  })
  Reserva: Reserva[];

  @ApiProperty({
    description: 'Lista de documentos subidos por el huésped secundario',
    example: [],
    type: () => [Documento],
  })
  documentos_subidos: Documento[];

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
}
