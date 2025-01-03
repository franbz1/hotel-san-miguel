import { NotFoundException } from '@nestjs/common';

/**
 * Error de Usuario no encontrado customizado.
 * @param id ID del usuario.
 * @returns Objeto con el mensaje de error.
 */
export default function notFoundError(id: number) {
  return new NotFoundException(`No se encontró el usuario con ID: ${id}`);
}
