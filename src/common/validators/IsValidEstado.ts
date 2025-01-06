import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EstadoHabitacion } from 'src/habitaciones/entities/estadosHbaitacion.enum';

const ESTADOS_VALIDOS = new Set(Object.values(EstadoHabitacion).map(String));

@ValidatorConstraint({ name: 'IsValidEstado', async: false })
export default class IsValidEstadoConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string): boolean {
    return ESTADOS_VALIDOS.has(value);
  }

  defaultMessage(): string {
    return `El estado debe ser uno de los siguientes: ${[...ESTADOS_VALIDOS].join(', ')}`;
  }
}
