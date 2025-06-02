import { ApiProperty } from '@nestjs/swagger';
import { TipoDoc } from '../../common/enums/tipoDoc.enum';
import { Genero } from '../../common/enums/generos.enum';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { HuespedSecundario } from 'src/huespedes-secundarios/entities/huesped-secundario.entity';
import { Documento } from 'src/documentos/entities/documento.entity';
import { Factura } from 'src/facturas/entities/factura.entity';
import { Formulario } from 'src/formularios/entities/formulario.entity';

export class Huesped {
  @ApiProperty({
    description: 'Identificador único del huésped',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tipo de documento del huésped',
    enum: TipoDoc,
    example: TipoDoc.CC,
  })
  tipo_documento: TipoDoc;

  @ApiProperty({
    description: 'Número de documento del huésped (debe ser único)',
    example: '123456789',
  })
  numero_documento: string;

  @ApiProperty({
    description: 'Primer apellido del huésped',
    example: 'Pérez',
  })
  primer_apellido: string;

  @ApiProperty({
    description: 'Segundo apellido del huésped (opcional)',
    example: 'García',
    required: false,
  })
  segundo_apellido?: string;

  @ApiProperty({
    description: 'Nombres del huésped',
    example: 'Juan Carlos',
  })
  nombres: string;

  @ApiProperty({
    description: 'País de residencia del huésped',
    example: 'Colombia',
  })
  pais_residencia: string;

  @ApiProperty({
    description: 'Ciudad de residencia del huésped',
    example: 'Medellín',
  })
  ciudad_residencia: string;

  @ApiProperty({
    description: 'País de procedencia del huésped',
    example: 'Colombia',
  })
  pais_procedencia: string;

  @ApiProperty({
    description: 'Ciudad de procedencia del huésped',
    example: 'Bogotá',
  })
  ciudad_procedencia: string;

  @ApiProperty({
    description: 'Lugar de nacimiento del huésped',
    example: 'Medellín, Colombia',
  })
  lugar_nacimiento: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del huésped',
    example: '1990-01-01T00:00:00.000Z',
    type: Date,
  })
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Nacionalidad del huésped',
    example: 'Colombiana',
  })
  nacionalidad: string;

  @ApiProperty({
    description: 'Ocupación del huésped',
    example: 'Ingeniero',
  })
  ocupacion: string;

  @ApiProperty({
    description: 'Género del huésped',
    enum: Genero,
    example: Genero.MASCULINO,
  })
  genero: Genero;

  @ApiProperty({
    description: 'Teléfono del huésped (opcional)',
    example: '+573001112233',
    required: false,
  })
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico del huésped (opcional)',
    example: 'juan.perez@example.com',
    required: false,
  })
  correo?: string;

  @ApiProperty({
    description: 'Lista de reservas del huésped',
    example: [],
    type: () => [Reserva],
  })
  reservas: Reserva[];

  @ApiProperty({
    description: 'Lista de huéspedes secundarios asociados',
    example: [],
    type: () => [HuespedSecundario],
  })
  huespedes_secundarios: HuespedSecundario[];

  @ApiProperty({
    description: 'Lista de documentos subidos por el huésped',
    example: [],
    type: () => [Documento],
  })
  documentos_subidos: Documento[];

  @ApiProperty({
    description: 'Lista de facturas asociadas al huésped',
    example: [],
    type: () => [Factura],
  })
  facturas: Factura[];

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de la última actualización del registro',
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

  @ApiProperty({
    description: 'Lista de formularios asociados al huésped',
    example: [],
    type: () => [Formulario],
  })
  Formulario: Formulario[];
}
