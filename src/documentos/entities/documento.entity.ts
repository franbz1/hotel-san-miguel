import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HuespedSecundario } from 'src/huespedes-secundarios/entities/huesped-secundario.entity';
import { Huesped } from 'src/huespedes/entities/huesped.entity';

/**
 * Representa un documento subido por el huésped
 */
export class Documento {
  @ApiProperty({
    description: 'Identificador único del documento',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'URL del documento',
    example: 'https://example.com/archivo.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Nombre del documento',
    example: 'Contrato.pdf',
  })
  nombre: string;

  @ApiPropertyOptional({
    description:
      'Identificador del huésped al que pertenece el documento (opcional)',
    example: 10,
  })
  huespedId?: number;

  @ApiPropertyOptional({
    description:
      'Identificador del huésped secundario al que pertenece el documento (opcional)',
    example: 5,
  })
  huespedSecundarioId?: number;

  @ApiPropertyOptional({
    description: 'Huésped al que pertenece el documento',
    type: () => Huesped,
  })
  huesped?: Huesped;

  @ApiPropertyOptional({
    description: 'Huésped secundario al que pertenece el documento',
    type: () => HuespedSecundario,
  })
  huespedSecundario?: HuespedSecundario;

  @ApiProperty({
    description: 'Fecha de creación del documento',
    example: '2023-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;
}
