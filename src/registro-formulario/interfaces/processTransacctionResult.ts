import {
  Factura,
  Formulario,
  Huesped,
  LinkFormulario,
  Reserva,
} from '@prisma/client';

export interface ProcessTransactionResult {
  success: boolean;
  huesped: Huesped;
  facturaCreated: Factura;
  reservaCreated: Reserva;
  formulario: Formulario;
  linkFormulario: LinkFormulario;
}
