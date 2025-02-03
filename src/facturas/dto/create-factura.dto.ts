import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsPositive } from 'class-validator';

export class CreateFacturaDto {
  @ApiProperty({
    description: 'El total de la factura, que debe ser un número positivo',
    example: 150.75,
  })
  @IsPositive({
    message:
      'El total de la factura es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  total: number;

  @ApiProperty({
    description: 'La fecha de la factura',
    example: '2023-08-15T00:00:00.000Z',
  })
  @IsDate({
    message: 'La fecha de la factura es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_factura: Date;

  @ApiProperty({
    description:
      'Identificador del huésped asociado a la factura, debe ser un número positivo',
    example: 1,
  })
  @IsPositive({
    message: 'El huesped es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  huespedId: number;
}
