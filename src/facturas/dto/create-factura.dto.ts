import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateFacturaDto {
  @IsPositive()
  total: number;

  @IsDate()
  fecha_factura: Date;

  @IsDate()
  fecha_entrada: Date;

  @IsDate()
  fecha_salida: Date;

  @IsString()
  metodo_pago: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  huespedesIds: number[];

  @IsNumber()
  reservaId: number;
}
