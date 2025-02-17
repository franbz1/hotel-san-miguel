import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    description: 'Identificador del huésped al que pertenece el documento',
    example: 10,
  })
  huespedId: number;

  @ApiProperty({
    description: 'Fecha de creación del documento',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
