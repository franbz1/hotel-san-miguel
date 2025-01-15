import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  //Validate,
} from 'class-validator';
//import { IsValidRolConstraint } from 'src/common/validators/IsValidRol';
import { Role } from '../entities/rol.enum';

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

  @IsEnum(Role, {
    message: `El rol es obligatorio y debe ser uno de los siguientes: ${Object.values(
      Role,
    ).join(', ')}`,
    always: true,
  })
  public rol: Role;

  @IsString({
    message: 'La contraseña es obligatoria y debe ser un texto',
    always: true,
  })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
    always: true,
  })
  @MaxLength(50, {
    message: 'La contraseña no puede tener más de 50 caracteres',
    always: true,
  })
  public password: string;

  /**
  @IsString()
  @Validate(IsValidRolConstraint)
  public rol: string;
   */
}
