import { TipoDoc } from 'src/huespedes/entities/tipoDoc.enum';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const TIPOS_DOC_VALIDOS = new Set(Object.values(TipoDoc).map(String));

@ValidatorConstraint({ name: 'IsValidTipoDoc', async: false })
export class IsValidTipoDocConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return TIPOS_DOC_VALIDOS.has(value);
  }

  defaultMessage(): string {
    return `El tipo de documento debe ser uno de los siguientes: ${[...TIPOS_DOC_VALIDOS].join(', ')}`;
  }
}
