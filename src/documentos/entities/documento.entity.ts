/**
 * Representa un documento subido por el huesped
 */
export class Documento {
  id: number;
  url: string;
  nombre: string;
  huespedId: number;
  createdAt: Date;
}
