import { ApiProperty } from '@nestjs/swagger';
import { Role } from './rol.enum';
/**
 * Es un usuario interno de la compañía
 */
export class Usuario {
  @ApiProperty({
    description: 'Identificador único del usuario',
    example: 1,
  })
  public id: number;

  @ApiProperty({
    description: 'El nombre del usuario debe ser algo sencillo y corto',
    example: 'Juan Pérez',
  })
  public nombre: string;

  @ApiProperty({
    description:
      'El rol del usuario es el rol que tiene el usuario dentro de la compañía',
    enum: Role,
    example: Role.ADMINISTRADOR,
  })
  public rol: Role;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'contraseña123',
  })
  public password: string;
}
