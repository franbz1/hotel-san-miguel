import { Type } from 'class-transformer';
import { IsDate, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { IsValidEstadoReserva } from 'src/common/validators/IsValidEstadoReserva';

export class CreateReservaDto {
  @IsDate({
    message:
      'La fecha de inicio de la reserva es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_inicio: Date;

  @IsDate({
    message:
      'La fecha de fin de la reserva es obligatoria y debe ser una fecha',
  })
  @Type(() => Date)
  fecha_fin: Date;

  @IsString({
    message: 'El estado de la reserva es obligatorio y debe ser una cadena',
  })
  @Validate(IsValidEstadoReserva)
  estado: string;
}
