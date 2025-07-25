import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Role } from '../entities/rol.enum';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'El nombre del usuario. Debe ser un texto sencillo y corto.',
    example: 'juan',
  })
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

  @ApiProperty({
    description: `El rol del usuario. Debe ser uno de los siguientes: ${Object.values(
      Role,
    ).join(', ')}`,
    example: Role.ADMINISTRADOR,
    enum: Role,
  })
  @IsEnum(Role, {
    message: `El rol es obligatorio y debe ser uno de los siguientes: ${Object.values(
      Role,
    ).join(', ')}`,
    always: true,
  })
  public rol: Role;

  @ApiProperty({
    description:
      'La contraseña del usuario. Debe ser un texto con una longitud mínima de 6 caracteres.',
    example: '123456',
  })
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
}
