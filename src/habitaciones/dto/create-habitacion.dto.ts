import { IsInt, IsNumber, IsPositive, Validate } from 'class-validator';
import { TipoHabitacion } from '../entities/tipoHabitacion.enum';
import IsValidTipoHabitacionConstraint from 'src/common/validators/IsValidTipoHabitacion.enum';
import { EstadoHabitacion } from '../entities/estadosHbaitacion.enum';
import IsValidEstadoConstraint from 'src/common/validators/IsValidEstado';
import { Type } from 'class-transformer';

export class CreateHabitacionDto {
  @IsInt({
    message:
      'El número de habitación es obligatorio y debe ser un número entero',
  })
  @Type(() => Number)
  numero_habitacion: number;

  @Validate(IsValidTipoHabitacionConstraint)
  tipo: TipoHabitacion;

  @Validate(IsValidEstadoConstraint)
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
