/**
 * Representa una factura de un huesped
 */

export class Factura {
  id: number;
  total: number;
  fecha_factura: Date;
  fecha_entrada: Date;
  fecha_salida: Date;
  metodo_pago: string;
  huespedesIds: number[];
  reservaId: number;
}
