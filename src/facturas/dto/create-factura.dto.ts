import { Type } from 'class-transformer';
import { IsDate, IsPositive } from 'class-validator';

export class CreateFacturaDto {
  @IsPositive({
    message:
      'El total de la factura es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  total: number;

  @IsDate({
    message: 'La fecha de la factura es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_factura: Date;

  @IsPositive({
    message: 'El huesped es obligatorio y debe ser un número positivo',
  })
  @Type(() => Number)
  huespedId: number;
}
