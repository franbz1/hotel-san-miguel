import { NotFoundException } from '@nestjs/common';

/**
 * Error de no encontrado customizado.
 * @param id ID del elemento que no se encuentra.
 * @returns Objeto con el mensaje de error.
 */
export default function notFoundError(id: number) {
  throw new NotFoundException(`No se encontró el elemento con el ID: ${id}`);
}
