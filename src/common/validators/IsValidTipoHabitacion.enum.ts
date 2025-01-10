import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TipoHabitacion } from 'src/common/enums/tipoHabitacion.enum';

const TIPOS_VALIDOS = new Set(Object.values(TipoHabitacion).map(String));

@ValidatorConstraint({ name: 'IsValidTipoHabitacion', async: false })
export default class IsValidTipoHabitacionConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string): boolean {
    return TIPOS_VALIDOS.has(value);
  }

  defaultMessage(): string {
    return `El tipo de habitación debe ser uno de los siguientes: ${[...TIPOS_VALIDOS].join(', ')}`;
  }
}
