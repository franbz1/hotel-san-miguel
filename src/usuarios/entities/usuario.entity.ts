import { Role } from './rol.enum';
/**
 * Es un usuario interno de la compañía
 */

export class Usuario {
  public id: number;
  /**
   * El nombre del usuario debe ser algo sencillo y corto
   */
  public nombre: string;
  /**
   * El rol del usuario es el rol que tiene el usuario dentro de la compañía
   */
  public rol: Role;
}
