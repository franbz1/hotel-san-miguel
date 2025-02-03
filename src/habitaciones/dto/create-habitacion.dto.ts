import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsPositive } from 'class-validator';
import { TipoHabitacion } from '../../common/enums/tipoHabitacion.enum';
import { EstadoHabitacion } from '../../common/enums/estadosHbaitacion.enum';
import { Type } from 'class-transformer';

export class CreateHabitacionDto {
  @ApiProperty({
    description:
      'El número de habitación es obligatorio y debe ser un número entero',
    example: 101,
  })
  @IsInt({
    message:
      'El número de habitación es obligatorio y debe ser un número entero',
  })
  @Type(() => Number)
  numero_habitacion: number;

  @ApiProperty({
    description: `El tipo de habitación es obligatorio y debe ser uno de los siguientes: ${Object.values(
      TipoHabitacion,
    ).join(', ')}`,
    enum: TipoHabitacion,
    example: TipoHabitacion.SENCILLA, // Ajusta el ejemplo según corresponda
  })
  @IsEnum(TipoHabitacion, {
    message: `El tipo de habitación es obligatorio y debe ser uno de los siguientes: ${Object.values(
      TipoHabitacion,
    ).join(', ')}`,
  })
  tipo: TipoHabitacion;

  @ApiProperty({
    description: `El estado de la habitación es obligatorio y debe ser uno de los siguientes: ${Object.values(
      EstadoHabitacion,
    ).join(', ')}`,
    enum: EstadoHabitacion,
    example: EstadoHabitacion.LIBRE, // Ajusta el ejemplo según corresponda
  })
  @IsEnum(EstadoHabitacion, {
    message: `El estado de la habitación es obligatorio y debe ser uno de los siguientes: ${Object.values(
      EstadoHabitacion,
    ).join(', ')}`,
  })
  estado: EstadoHabitacion;

  @ApiProperty({
    description:
      'El precio por noche es obligatorio y debe ser un número positivo',
    example: 150.5,
  })
  @IsPositive({
    message: 'El precio por noche es obligatorio y debe ser un número positivo',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio por noche debe ser un número con 2 decimales' },
  )
  @Type(() => Number)
  precio_por_noche: number;
}
