import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EstadosReserva } from 'src/reservas/entities/estadosReserva.enum';

const TIPOS_RESERVA_VALIDOS = new Set(
  Object.values(EstadosReserva).map(String),
);

@ValidatorConstraint({ name: 'IsValidEstadoReserva', async: false })
export class IsValidEstadoReserva implements ValidatorConstraintInterface {
  validate(value: string): Promise<boolean> | boolean {
    return TIPOS_RESERVA_VALIDOS.has(value);
  }

  defaultMessage(): string {
    return `El estado de la reserva debe ser uno de los siguientes: ${[...TIPOS_RESERVA_VALIDOS].join(', ')}`;
  }
}
