import { ApiProperty } from '@nestjs/swagger';

export class Factura {
  @ApiProperty({
    description: 'Identificador único de la factura',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Total de la factura',
    example: 150.75,
  })
  total: number;

  @ApiProperty({
    description: 'Fecha de la factura',
    example: '2023-08-15T00:00:00.000Z',
  })
  fecha_factura: Date;

  @ApiProperty({
    description: 'Identificador del huésped asociado a la factura',
    example: 1,
  })
  huespedId: number;
}
