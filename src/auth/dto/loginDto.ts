import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la autenticación de usuario.
 * Este objeto contiene las propiedades necesarias para realizar el login.
 */
export class LoginDto {
  /**
   * Nombre de usuario.
   * - Debe ser una cadena de caracteres.
   * - Longitud mínima: 3 caracteres.
   * - Longitud máxima: 50 caracteres.
   */
  @ApiProperty({
    description: 'Nombre de usuario',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nombre: string;

  /**
   * Contraseña del usuario.
   * - Debe ser una cadena de caracteres.
   * - Longitud mínima: 6 caracteres.
   * - Longitud máxima: 50 caracteres.
   */
  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
