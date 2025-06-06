/**
 * Interfaz para estrategias de agrupamiento temporal
 */
export interface AgrupamientoStrategy {
  /**
   * Construye la parte de generate_series del SQL
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @returns String SQL para generate_series
   */
  buildGenerateSeries(fechaInicio: Date, fechaFin: Date): string;

  /**
   * Obtiene el intervalo para sumar al período base
   * @returns String del intervalo (ej: "'1 day'", "'1 week'")
   */
  getIntervalo(): string;

  /**
   * Construye la consulta SQL completa
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @param tipoHabitacion Tipo de habitación opcional para filtrar
   * @returns String SQL completo
   */
  buildSql(fechaInicio: Date, fechaFin: Date, tipoHabitacion?: string): string;
}
