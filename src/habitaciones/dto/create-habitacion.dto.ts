import { IsEnum, IsInt, IsNumber, IsPositive } from 'class-validator';
import { TipoHabitacion } from '../../common/enums/tipoHabitacion.enum';
import { EstadoHabitacion } from '../../common/enums/estadosHbaitacion.enum';
import { Type } from 'class-transformer';

export class CreateHabitacionDto {
  @IsInt({
    message:
      'El número de habitación es obligatorio y debe ser un número entero',
  })
  @Type(() => Number)
  numero_habitacion: number;

  @IsEnum(TipoHabitacion, {
    message: `El tipo de habitación es obligatorio y debe ser uno de los siguientes: ${Object.values(
      TipoHabitacion,
    ).join(', ')}`,
  })
  tipo: TipoHabitacion;

  @IsEnum(EstadoHabitacion, {
    message: `El estado de la habitación es obligatorio y debe ser uno de los siguientes: ${Object.values(
      EstadoHabitacion,
    ).join(', ')}`,
  })
  estado: EstadoHabitacion;

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
