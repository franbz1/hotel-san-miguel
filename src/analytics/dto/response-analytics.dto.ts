import { ApiProperty } from '@nestjs/swagger';
import { MotivosViajes } from '@prisma/client';

/**
 * DTO para respuesta de ocupación por período
 */
export class OcupacionPorPeriodoDto {
  @ApiProperty({
    description: 'Período de la ocupación (fecha)',
    example: '2024-01',
  })
  periodo: string;

  @ApiProperty({
    description: 'Tasa de ocupación (porcentaje)',
    example: 75.5,
  })
  tasaOcupacion: number;

  @ApiProperty({
    description: 'Revenue per Available Room (RevPAR)',
    example: 45000,
  })
  revpar: number;

  @ApiProperty({
    description: 'Average Daily Rate (ADR)',
    example: 60000,
  })
  adr: number;

  @ApiProperty({
    description: 'Total de reservas en el período',
    example: 25,
  })
  totalReservas: number;

  @ApiProperty({
    description: 'Ingresos totales del período',
    example: 1125000,
  })
  ingresosTotales: number;
}

/**
 * DTO para respuesta de análisis de ocupación
 */
export class AnalisisOcupacionResponseDto {
  @ApiProperty({
    description: 'Ocupación por períodos',
    type: [OcupacionPorPeriodoDto],
  })
  ocupacionPorPeriodo: OcupacionPorPeriodoDto[];

  @ApiProperty({
    description: 'Tasa de ocupación promedio',
    example: 72.3,
  })
  ocupacionPromedio: number;

  @ApiProperty({
    description: 'RevPAR promedio',
    example: 43500,
  })
  revparPromedio: number;

  @ApiProperty({
    description: 'ADR promedio',
    example: 58000,
  })
  adrPromedio: number;
}

/**
 * DTO para datos demográficos de huéspedes
 */
export class DemografiaHuespedesDto {
  @ApiProperty({
    description: 'Nacionalidad',
    example: 'Colombia',
  })
  nacionalidad: string;

  @ApiProperty({
    description: 'Cantidad de huéspedes',
    example: 45,
  })
  cantidad: number;

  @ApiProperty({
    description: 'Porcentaje del total',
    example: 32.1,
  })
  porcentaje: number;

  @ApiProperty({
    description: 'Ingresos generados por esta nacionalidad',
    example: 2700000,
  })
  ingresos: number;
}

/**
 * DTO para procedencia de huéspedes
 */
export class ProcedenciaHuespedesDto {
  @ApiProperty({
    description: 'País de procedencia',
    example: 'Colombia',
  })
  paisProcedencia: string;

  @ApiProperty({
    description: 'Ciudad de procedencia',
    example: 'Bogotá',
  })
  ciudadProcedencia: string;

  @ApiProperty({
    description: 'Cantidad de huéspedes',
    example: 28,
  })
  cantidad: number;

  @ApiProperty({
    description: 'Porcentaje del total',
    example: 20.1,
  })
  porcentaje: number;
}

/**
 * DTO para rendimiento de habitaciones individuales
 */
export class RendimientoHabitacionDto {
  @ApiProperty({
    description: 'ID único de la habitación',
    example: 'clm123456789abcdef',
  })
  habitacionId: string;

  @ApiProperty({
    description: 'Número de la habitación',
    example: '101',
  })
  numeroHabitacion: string;

  @ApiProperty({
    description: 'Tipo de habitación',
    example: 'SENCILLA',
  })
  tipo: string;

  @ApiProperty({
    description: 'Ingresos totales generados por la habitación en el período',
    example: 850000,
  })
  ingresosTotales: number;

  @ApiProperty({
    description: 'Número total de reservas realizadas en la habitación',
    example: 15,
  })
  totalReservas: number;

  @ApiProperty({
    description: 'Número total de noches vendidas en el período',
    example: 42,
  })
  nochesVendidas: number;

  @ApiProperty({
    description: 'Ingreso promedio por reserva',
    example: 56666.67,
  })
  ingresoPromedioReserva: number;

  @ApiProperty({
    description: 'Porcentaje de ocupación de la habitación en el período',
    example: 75.23,
  })
  porcentajeOcupacion: number;
}

/**
 * DTO para análisis de motivos de viaje
 */
export class MotivosViajeDto {
  @ApiProperty({
    description: 'Motivo del viaje',
    enum: MotivosViajes,
    example: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
  })
  motivo: MotivosViajes;

  @ApiProperty({
    description: 'Cantidad de reservas con este motivo',
    example: 65,
  })
  cantidad: number;

  @ApiProperty({
    description: 'Porcentaje del total',
    example: 42.5,
  })
  porcentaje: number;

  @ApiProperty({
    description: 'Duración promedio de estancia (días)',
    example: 3.2,
  })
  duracionPromedioEstancia: number;
}

/**
 * DTO para predicción de ocupación
 */
export class PrediccionOcupacionDto {
  @ApiProperty({
    description: 'Período predicho',
    example: '2024-07',
  })
  periodo: string;

  @ApiProperty({
    description: 'Ocupación predicha (porcentaje)',
    example: 78.2,
  })
  ocupacionPredicida: number;

  @ApiProperty({
    description: 'Nivel de confianza de la predicción',
    example: 85.5,
  })
  nivelConfianza: number;

  @ApiProperty({
    description: 'Ingresos predichos',
    example: 4250000,
  })
  ingresosPredichos: number;
}

/**
 * DTO para el dashboard ejecutivo
 */
export class DashboardEjecutivoDto {
  @ApiProperty({
    description: 'KPI de ocupación actual',
    example: 75.8,
  })
  ocupacionActual: number;

  @ApiProperty({
    description: 'RevPAR actual',
    example: 45000,
  })
  revparActual: number;

  @ApiProperty({
    description: 'ADR actual',
    example: 59400,
  })
  adrActual: number;

  @ApiProperty({
    description: 'Ingresos del período',
    example: 12500000,
  })
  ingresosPeriodo: number;

  @ApiProperty({
    description: 'Top 5 mercados emisores',
    type: [DemografiaHuespedesDto],
  })
  topMercadosEmisores: DemografiaHuespedesDto[];

  @ApiProperty({
    description: 'Distribución por motivo de viaje',
    type: [MotivosViajeDto],
  })
  distribucionMotivosViaje: MotivosViajeDto[];

  @ApiProperty({
    description:
      'Rendimiento por habitación individual (ordenado por ingresos)',
    type: [RendimientoHabitacionDto],
  })
  rendimientoHabitaciones: RendimientoHabitacionDto[];

  @ApiProperty({
    description: 'Tasa de huéspedes recurrentes (porcentaje)',
    example: 18.5,
  })
  tasaHuespedesRecurrentes: number;

  @ApiProperty({
    description: 'Comparación con período anterior (opcional)',
    required: false,
  })
  comparacionPeriodoAnterior?: {
    ocupacionAnterior: number;
    revparAnterior: number;
    adrAnterior: number;
    ingresosAnteriores: number;
    cambioOcupacion: number;
    cambioRevpar: number;
    cambioAdr: number;
    cambioIngresos: number;
  };
}
