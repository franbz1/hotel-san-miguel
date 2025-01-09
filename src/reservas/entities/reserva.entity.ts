export class Reserva {
  id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: string;
  pais_procedencia: string;
  departamento_procedencia: string;
  ciudad_procedencia: string;
  pais_destino: string;
  motivo_viaje: string;
  check_in: Date;
  check_out: Date;
  costo: number;
  numero_acompaniantes: number;
  habitacion_id: number;
  huesped_id: number;
  factura_id: number;
}
