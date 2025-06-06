import { AgrupamientoStrategy } from './agrupamiento.interface';

/**
 * Estrategia de agrupamiento por año
 */
export class AñoAgrupamientoStrategy implements AgrupamientoStrategy {
  buildGenerateSeries(fechaInicio: Date, fechaFin: Date): string {
    const inicio = fechaInicio.toISOString().split('T')[0];
    const fin = fechaFin.toISOString().split('T')[0];
    return `SELECT generate_series(date_trunc('year', '${inicio}'::date), date_trunc('year', '${fin}'::date), '1 year'::interval) AS periodo`;
  }

  getIntervalo(): string {
    return "'1 year'";
  }

  buildSql(fechaInicio: Date, fechaFin: Date, tipoHabitacion?: string): string {
    const generateSeries = this.buildGenerateSeries(fechaInicio, fechaFin);

    const tipoHabitacionFilter = tipoHabitacion
      ? `AND h.tipo::text = '${tipoHabitacion}'`
      : '';

    return `
      WITH periodos_base AS (
        ${generateSeries}
      )
      SELECT
        pb.periodo AS periodo,
        COUNT(DISTINCT r."habitacionId")::bigint AS habitaciones_ocupadas,
        COUNT(r.id)::bigint AS total_reservas,
        COALESCE(SUM(r.costo), 0)::numeric AS ingresos_totales
      FROM periodos_base pb
      LEFT JOIN "Reserva" r
        ON r.deleted = false
          AND r."fecha_inicio"::date <= (pb.periodo + INTERVAL '1 year' - INTERVAL '1 day')::date
          AND r."fecha_fin"::date > pb.periodo::date
      LEFT JOIN "Habitacion" h 
        ON r."habitacionId" = h.id 
        AND h.deleted = false 
        ${tipoHabitacionFilter}
      GROUP BY pb.periodo
      ORDER BY pb.periodo
    `;
  }
}
