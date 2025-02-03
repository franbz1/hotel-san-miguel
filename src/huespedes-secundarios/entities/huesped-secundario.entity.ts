import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genero } from 'src/common/enums/generos.enum';
import { TipoDoc } from 'src/common/enums/tipoDoc.enum';

export class HuespedSecundario {
  @ApiProperty({
    description: 'Identificador único del huésped secundario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tipo de documento del huésped secundario',
    enum: TipoDoc,
    example: TipoDoc.CC, // Ajusta el ejemplo según corresponda
  })
  tipo_documento: TipoDoc;

  @ApiProperty({
    description: 'Número de documento del huésped secundario',
    example: '12345678',
  })
  numero_documento: string;

  @ApiProperty({
    description: 'Primer apellido del huésped secundario',
    example: 'Pérez',
  })
  primer_apellido: string;

  @ApiProperty({
    description: 'Segundo apellido del huésped secundario',
    example: 'García',
  })
  segundo_apellido: string;

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
    description: 'Departamento de residencia del huésped secundario',
    example: 'Antioquia',
  })
  departamento_residencia: string;

  @ApiProperty({
    description: 'Ciudad de residencia del huésped secundario',
    example: 'Medellín',
  })
  ciudad_residencia: string;

  @ApiProperty({
    description: 'Lugar de nacimiento del huésped secundario',
    example: 'Cali',
  })
  lugar_nacimiento: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del huésped secundario',
    example: '1990-01-01T00:00:00.000Z',
  })
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Nacionalidad del huésped secundario',
    example: 'Colombiano',
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
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo del huésped secundario (opcional)',
    example: 'correo@example.com',
  })
  correo?: string;

  @ApiProperty({
    description:
      'Identificador del huésped principal al que pertenece el secundario',
    example: 1,
  })
  huespedId: number;

  @ApiProperty({
    description: 'Lista de documentos subidos por el huésped secundario',
    example: [],
  })
  documentos_subidos: [];
}
