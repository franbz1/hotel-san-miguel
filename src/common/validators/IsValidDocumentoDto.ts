import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidDocumentoDto', async: false })
export class IsValidDocumentoDto implements ValidatorConstraintInterface {
  validate(value: any) {
    const { huespedId, huespedSecundarioId } = value;

    console.log(huespedId, huespedSecundarioId);

    return (
      (huespedId !== undefined && huespedSecundarioId === undefined) ||
      (huespedId === undefined && huespedSecundarioId !== undefined)
    );
  }
  defaultMessage(): string {
    return 'Debe proporcionar huespedId o huespedSecundarioId, pero no ambos.';
  }
}
