import { Rol } from 'src/usuarios/entities/rol.enum';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const ROLES_VALIDOS = new Set(Object.values(Rol).map(String));

@ValidatorConstraint({ name: 'IsValidRol', async: false })
export class IsValidRolConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return ROLES_VALIDOS.has(value);
  }

  defaultMessage(): string {
    return `El rol debe ser uno de los siguientes: ${[...ROLES_VALIDOS].join(', ')}`;
  }
}
