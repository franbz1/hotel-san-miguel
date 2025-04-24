import { ApiProperty } from '@nestjs/swagger';
import { TipoDoc } from '../../common/enums/tipoDoc.enum';

export class Huesped {
  @ApiProperty({
    description: 'Identificador único del huésped',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tipo de documento del huésped',
    enum: TipoDoc,
    example: TipoDoc.CC, // Ajusta el ejemplo según tus valores definidos en TipoDoc
  })
  tipo_documento: TipoDoc;

  @ApiProperty({
    description: 'Número de documento del huésped',
    example: '123456789',
  })
  numero_documento: string;

  @ApiProperty({
    description: 'Primer apellido del huésped',
    example: 'Pérez',
  })
  prmimer_apellido: string;

  @ApiProperty({
    description: 'Segundo apellido del huésped',
    example: 'García',
  })
  segundo_apellido: string;

  @ApiProperty({
    description: 'Nombres del huésped',
    example: 'Juan Carlos',
  })
  nombres: string;

  @ApiProperty({
    description: 'País de residencia del huésped',
    example: 'Colombia',
  })
  pais_recidencia: string;

  @ApiProperty({
    description: 'Ciudad de residencia del huésped',
    example: 'Medellín',
  })
  ciudad_recidencia: string;

  @ApiProperty({
    description: 'País de procedencia del huésped',
    example: 'Colombia',
  })
  pais_procedencia: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del huésped',
    example: '1990-01-01T00:00:00.000Z',
  })
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Nacionalidad del huésped',
    example: 'Colombiano',
  })
  nacionalidad: string;

  @ApiProperty({
    description: 'Ocupación del huésped',
    example: 'Ingeniero',
  })
  ocupacion: string;

  @ApiProperty({
    description: 'Género del huésped',
    example: 'Masculino',
  })
  genero: string;

  @ApiProperty({
    description: 'Teléfono del huésped',
    example: '+573001112233',
  })
  telefono: string;

  @ApiProperty({
    description: 'Correo electrónico del huésped',
    example: 'juan.perez@example.com',
  })
  correo: string;

  @ApiProperty({
    description: 'Lista de reservas del huésped (puede estar vacío o nulo)',
    example: [],
    nullable: true,
  })
  reservas: [] | null;

  @ApiProperty({
    description: 'Lista de huéspedes secundarios (puede estar vacío o nulo)',
    example: [],
    nullable: true,
  })
  huespedes_secundarios: [] | null;

  @ApiProperty({
    description: 'Lista de documentos subidos (puede estar vacío o nulo)',
    example: [],
    nullable: true,
  })
  documentos_subidos: [] | null;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de la última actualización del registro',
    example: '2023-01-02T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indica si el registro ha sido eliminado',
    example: false,
  })
  deleted: boolean;
}
