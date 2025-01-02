import {
  IsString,
  MinLength,
  MaxLength,
  //IsEnum,
  Validate,
} from 'class-validator';
import { IsValidRolConstraint } from 'src/common/validators/IsValidRol';
//import { Rol } from '../entities/rol.enum';

export class CreateUsuarioDto {
  @IsString({
    message: 'El nombre es obligatorio y debe ser un texto',
    always: true,
  })
  @MinLength(3, {
    message: 'El nombre debe tener al menos 3 caracteres',
    always: true,
  })
  @MaxLength(50, {
    message: 'El nombre no puede tener más de 50 caracteres',
    always: true,
  })
  public nombre: string;

  /* 
    De momento se usara Sqlite como db de desarrollo y no soporta enums por lo cual se usa la validación manual
    @IsEnum(Rol, {
    message: `El rol es obligatorio y debe ser uno de los siguientes: ${Object.values(
      Rol,
    ).join(', ')}`,
    always: true,
  })
  */
  @IsString()
  @Validate(IsValidRolConstraint)
  public rol: string;
}
