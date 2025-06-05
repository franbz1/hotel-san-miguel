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
    example: 'juan',
  })
  public nombre: string;

  @ApiProperty({
    description:
      'El rol del usuario es el rol que tiene el usuario dentro de la compañía',
    enum: Role,
    example: Role.ADMINISTRADOR,
    default: Role.CAJERO,
  })
  public rol: Role;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: '123456',
  })
  public password: string;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del usuario',
    example: '2024-01-15T10:30:00Z',
    type: Date,
  })
  public updatedAt: Date;

  @ApiProperty({
    description: 'Indica si el usuario ha sido eliminado (soft delete)',
    example: false,
    default: false,
  })
  public deleted: boolean;
}
