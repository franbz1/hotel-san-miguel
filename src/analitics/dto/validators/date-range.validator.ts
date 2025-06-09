import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateRangeValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateRangeValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const startDate = (args.object as any).startDate;
          const endDate = (args.object as any).endDate;

          if (!startDate || !endDate) {
            return true; // Si faltan fechas, otros validadores se encargarán
          }

          const start = new Date(startDate);
          const end = new Date(endDate);

          // Verificar que las fechas sean válidas
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return true; // Otros validadores se encargarán de formato
          }

          return start <= end;
        },
        defaultMessage() {
          return 'La fecha de inicio no puede ser mayor que la fecha de fin';
        },
      },
    });
  };
}
