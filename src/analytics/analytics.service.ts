import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  FiltrosAnalyticsDto,
  FiltrosOcupacionDto,
  FiltrosDashboardDto,
  ForecastParamsDto,
} from './dto/filtros-analytics.dto';
import {
  AnalisisOcupacionResponseDto,
  DemografiaHuespedesDto,
  ProcedenciaHuespedesDto,
  RendimientoHabitacionDto,
  MotivosViajeDto,
  PrediccionOcupacionDto,
  DashboardEjecutivoDto,
  OcupacionPorPeriodoDto,
} from './dto/response-analytics.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service para manejar las analíticas del hotel
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs', 'analytics');

  constructor(private readonly prisma: PrismaService) {
    // Crear directorio de logs si no existe
    this.ensureLogsDirectory();
  }

  /**
   * Asegura que el directorio de logs exista
   */
  private ensureLogsDirectory(): void {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
    } catch (error) {
      this.logger.error(`Error al crear directorio de logs: ${error.message}`);
    }
  }

  /**
   * Guarda los resultados de una analítica en un archivo log
   */
  private async saveAnalyticsLog(
    tipoAnalitica: string,
    filtros: any,
    resultado: any,
    duracionMs: number,
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const fileName = `${tipoAnalitica}_${timestamp.split('T')[0]}.log`;
      const logPath = path.join(this.logsDir, fileName);

      const logEntry = {
        timestamp,
        tipoAnalitica,
        filtros,
        duracionMs,
        cantidadResultados: Array.isArray(resultado) ? resultado.length : 1,
        resultado,
        metadata: {
          usuario: 'sistema', // Se puede mejorar para capturar usuario real
          version: '1.0.0',
        },
      };

      const logLine = JSON.stringify(logEntry, null, 2) + '\n\n';

      // Escribir de forma asíncrona
      fs.appendFileSync(logPath, logLine);

      this.logger.log(
        `Analítica ${tipoAnalitica} guardada en log: ${fileName}`,
      );
    } catch (error) {
      this.logger.error(`Error al guardar log de analítica: ${error.message}`);
    }
  }

  /**
   * Calcula la ocupación del hotel por períodos
   * @param filtros Filtros para la consulta de ocupación
   * @returns Análisis detallado de ocupación
   */
  async calcularOcupacion(
    filtros: FiltrosOcupacionDto,
  ): Promise<AnalisisOcupacionResponseDto> {
    const {
      fechaInicio,
      fechaFin,
      agruparPor = 'mes',
      tipoHabitacion,
    } = filtros;

    // Determinar la función de agrupación SQL según el período
    const dateFunction = this.getDateTruncFunction(agruparPor);

    // Consulta optimizada para obtener ocupación por período
    const ocupacionPorPeriodo = await this.prisma.$queryRaw<
      Array<{
        periodo: string;
        total_reservas: bigint;
        ingresos_totales: number;
        precio_promedio: number;
      }>
    >`
      SELECT 
        ${dateFunction} as periodo,
        COUNT(*)::bigint as total_reservas,
        SUM(costo) as ingresos_totales,
        AVG(costo) as precio_promedio
      FROM "Reserva" r
      LEFT JOIN "Habitacion" h ON r."habitacionId" = h.id
      WHERE r.deleted = false
        ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
        ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
        ${tipoHabitacion ? Prisma.sql`AND h.tipo::text = ${tipoHabitacion}` : Prisma.empty}
      GROUP BY ${dateFunction}
      ORDER BY periodo DESC
    `;

    // Obtener el número total de habitaciones para calcular ocupación
    const totalHabitaciones = await this.prisma.habitacion.count({
      where: {
        deleted: false,
        ...(tipoHabitacion && { tipo: tipoHabitacion }),
      },
    });

    // Procesar los datos para calcular métricas
    const datosOcupacion: OcupacionPorPeriodoDto[] = ocupacionPorPeriodo.map(
      (item) => {
        const totalReservas = Number(item.total_reservas);
        const ingresosTotales = item.ingresos_totales || 0;
        const adr = item.precio_promedio || 0;

        // Calcular tasa de ocupación (simplificado)
        const tasaOcupacion =
          totalHabitaciones > 0 ? (totalReservas / totalHabitaciones) * 100 : 0;

        // Calcular RevPAR
        const revpar = (tasaOcupacion / 100) * adr;

        return {
          periodo: item.periodo,
          tasaOcupacion: Number(tasaOcupacion.toFixed(2)),
          revpar: Number(revpar.toFixed(2)),
          adr: Number(adr.toFixed(2)),
          totalReservas,
          ingresosTotales: Number(ingresosTotales.toFixed(2)),
        };
      },
    );

    // Calcular promedios generales
    const ocupacionPromedio =
      datosOcupacion.reduce((sum, item) => sum + item.tasaOcupacion, 0) /
      (datosOcupacion.length || 1);

    const revparPromedio =
      datosOcupacion.reduce((sum, item) => sum + item.revpar, 0) /
      (datosOcupacion.length || 1);

    const adrPromedio =
      datosOcupacion.reduce((sum, item) => sum + item.adr, 0) /
      (datosOcupacion.length || 1);

    return {
      ocupacionPorPeriodo: datosOcupacion,
      ocupacionPromedio: Number(ocupacionPromedio.toFixed(2)),
      revparPromedio: Number(revparPromedio.toFixed(2)),
      adrPromedio: Number(adrPromedio.toFixed(2)),
    };
  }

  /**
   * Analiza la demografía de los huéspedes (principales y secundarios)
   * @param filtros Filtros para el análisis demográfico
   * @returns Análisis demográfico de huéspedes
   */
  async analizarDemografia(
    filtros: FiltrosAnalyticsDto,
  ): Promise<DemografiaHuespedesDto[]> {
    const startTime = Date.now();
    const { fechaInicio, fechaFin, nacionalidades, motivoViaje } = filtros;

    try {
      // Si no hay filtros temporales o de motivo, contar todos los huéspedes directamente
      if (!fechaInicio && !fechaFin && !motivoViaje) {
        const demografiaData = await this.prisma.$queryRaw<
          Array<{
            nacionalidad: string;
            cantidad: bigint;
            ingresos: number;
          }>
        >`
          WITH todos_huespedes AS (
            -- Huéspedes principales
            SELECT 
              h.nacionalidad,
              h.id as huesped_id,
              'principal' as tipo_huesped
            FROM "Huesped" h
            WHERE h.deleted = false
              ${nacionalidades && nacionalidades.length > 0 ? Prisma.sql`AND h.nacionalidad = ANY(${nacionalidades})` : Prisma.empty}
            
            UNION ALL
            
            -- Huéspedes secundarios
            SELECT 
              hs.nacionalidad,
              hs.id as huesped_id,
              'secundario' as tipo_huesped
            FROM "HuespedSecundario" hs
            WHERE hs.deleted = false
              ${nacionalidades && nacionalidades.length > 0 ? Prisma.sql`AND hs.nacionalidad = ANY(${nacionalidades})` : Prisma.empty}
          ),
          ingresos_por_huesped AS (
            -- Calcular ingresos por huésped principal
            SELECT 
              r."huespedId" as huesped_id,
              SUM(r.costo) as total_ingresos
            FROM "Reserva" r
            WHERE r.deleted = false
            GROUP BY r."huespedId"
            
            UNION ALL
            
            -- Calcular ingresos por huésped secundario
            SELECT 
              hsr."A" as huesped_id,
              SUM(r.costo) as total_ingresos
            FROM "_HuespedSecundarioToReserva" hsr
            JOIN "Reserva" r ON hsr."B" = r.id
            WHERE r.deleted = false
            GROUP BY hsr."A"
          )
          SELECT 
            th.nacionalidad,
            COUNT(DISTINCT th.huesped_id)::bigint as cantidad,
            COALESCE(SUM(iph.total_ingresos), 0) as ingresos
          FROM todos_huespedes th
          LEFT JOIN ingresos_por_huesped iph ON th.huesped_id = iph.huesped_id
          GROUP BY th.nacionalidad
          ORDER BY cantidad DESC, ingresos DESC
        `;

        const totalHuespedes = demografiaData.reduce(
          (sum, item) => sum + Number(item.cantidad),
          0,
        );

        const resultado = demografiaData.map((item) => ({
          nacionalidad: item.nacionalidad,
          cantidad: Number(item.cantidad),
          porcentaje: Number(
            ((Number(item.cantidad) / totalHuespedes) * 100).toFixed(2),
          ),
          ingresos: Number((item.ingresos || 0).toFixed(2)),
        }));

        // Guardar log de la analítica
        const duracionMs = Date.now() - startTime;
        await this.saveAnalyticsLog(
          'demografia',
          filtros,
          resultado,
          duracionMs,
        );

        return resultado;
      }

      // Para filtros con fechas o motivos, usar la query original modificada
      const demografiaData = await this.prisma.$queryRaw<
        Array<{
          nacionalidad: string;
          cantidad: bigint;
          ingresos: number;
        }>
      >`
        WITH huespedes_con_filtros AS (
          -- Huéspedes principales con reservas que cumplen filtros
          SELECT DISTINCT
            h.nacionalidad,
            h.id as huesped_id,
            'principal' as tipo_huesped
          FROM "Huesped" h
          JOIN "Reserva" r ON h.id = r."huespedId" AND r.deleted = false
          WHERE h.deleted = false
            ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
            ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
            ${motivoViaje ? Prisma.sql`AND r.motivo_viaje::text = ${motivoViaje}` : Prisma.empty}
            ${nacionalidades && nacionalidades.length > 0 ? Prisma.sql`AND h.nacionalidad = ANY(${nacionalidades})` : Prisma.empty}
          
          UNION
          
          -- Huéspedes secundarios con reservas que cumplen filtros
          SELECT DISTINCT
            hs.nacionalidad,
            hs.id as huesped_id,
            'secundario' as tipo_huesped
          FROM "HuespedSecundario" hs
          JOIN "_HuespedSecundarioToReserva" hsr ON hs.id = hsr."A"
          JOIN "Reserva" r ON hsr."B" = r.id AND r.deleted = false
          WHERE hs.deleted = false
            ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
            ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
            ${motivoViaje ? Prisma.sql`AND r.motivo_viaje::text = ${motivoViaje}` : Prisma.empty}
            ${nacionalidades && nacionalidades.length > 0 ? Prisma.sql`AND hs.nacionalidad = ANY(${nacionalidades})` : Prisma.empty}
        ),
        ingresos_filtrados AS (
          -- Ingresos de huéspedes principales con filtros
          SELECT 
            h.id as huesped_id,
            SUM(r.costo) as total_ingresos
          FROM "Huesped" h
          JOIN "Reserva" r ON h.id = r."huespedId" AND r.deleted = false
          WHERE h.deleted = false
            ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
            ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
            ${motivoViaje ? Prisma.sql`AND r.motivo_viaje::text = ${motivoViaje}` : Prisma.empty}
          GROUP BY h.id
          
          UNION ALL
          
          -- Ingresos de huéspedes secundarios con filtros
          SELECT 
            hs.id as huesped_id,
            SUM(r.costo) as total_ingresos
          FROM "HuespedSecundario" hs
          JOIN "_HuespedSecundarioToReserva" hsr ON hs.id = hsr."A"
          JOIN "Reserva" r ON hsr."B" = r.id AND r.deleted = false
          WHERE hs.deleted = false
            ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
            ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
            ${motivoViaje ? Prisma.sql`AND r.motivo_viaje::text = ${motivoViaje}` : Prisma.empty}
          GROUP BY hs.id
        )
        SELECT 
          hf.nacionalidad,
          COUNT(DISTINCT hf.huesped_id)::bigint as cantidad,
          COALESCE(SUM(if_data.total_ingresos), 0) as ingresos
        FROM huespedes_con_filtros hf
        LEFT JOIN ingresos_filtrados if_data ON hf.huesped_id = if_data.huesped_id
        GROUP BY hf.nacionalidad
        ORDER BY cantidad DESC, ingresos DESC
      `;

      const totalHuespedes = demografiaData.reduce(
        (sum, item) => sum + Number(item.cantidad),
        0,
      );

      const resultado = demografiaData.map((item) => ({
        nacionalidad: item.nacionalidad,
        cantidad: Number(item.cantidad),
        porcentaje: Number(
          ((Number(item.cantidad) / totalHuespedes) * 100).toFixed(2),
        ),
        ingresos: Number((item.ingresos || 0).toFixed(2)),
      }));

      // Guardar log de la analítica
      const duracionMs = Date.now() - startTime;
      await this.saveAnalyticsLog('demografia', filtros, resultado, duracionMs);

      return resultado;
    } catch (error) {
      const duracionMs = Date.now() - startTime;
      this.logger.error(
        `Error en analítica de demografía (${duracionMs}ms): ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Analiza la procedencia de los huéspedes (principales y secundarios)
   * @param filtros Filtros para el análisis de procedencia
   * @returns Análisis de procedencia de huéspedes
   */
  async analizarProcedencia(
    filtros: FiltrosAnalyticsDto,
  ): Promise<ProcedenciaHuespedesDto[]> {
    const startTime = Date.now();
    const { fechaInicio, fechaFin, paisesProcedencia } = filtros;

    try {
      // Si no hay filtros temporales, contar todos los huéspedes directamente
      if (!fechaInicio && !fechaFin) {
        const procedenciaData = await this.prisma.$queryRaw<
          Array<{
            pais_procedencia: string;
            ciudad_procedencia: string;
            cantidad: bigint;
          }>
        >`
          WITH todos_huespedes_procedencia AS (
            -- Procedencia de huéspedes principales
            SELECT 
              COALESCE(h.pais_procedencia, 'No especificado') as pais_procedencia,
              COALESCE(h.ciudad_procedencia, 'No especificada') as ciudad_procedencia,
              h.id as huesped_id,
              'principal' as tipo_huesped
            FROM "Huesped" h
            WHERE h.deleted = false
              ${paisesProcedencia && paisesProcedencia.length > 0 ? Prisma.sql`AND h.pais_procedencia = ANY(${paisesProcedencia})` : Prisma.empty}
            
            UNION ALL
            
            -- Procedencia de huéspedes secundarios
            SELECT 
              COALESCE(hs.pais_procedencia, 'No especificado') as pais_procedencia,
              COALESCE(hs.ciudad_procedencia, 'No especificada') as ciudad_procedencia,
              hs.id as huesped_id,
              'secundario' as tipo_huesped
            FROM "HuespedSecundario" hs
            WHERE hs.deleted = false
              ${paisesProcedencia && paisesProcedencia.length > 0 ? Prisma.sql`AND hs.pais_procedencia = ANY(${paisesProcedencia})` : Prisma.empty}
          )
          SELECT 
            pais_procedencia,
            ciudad_procedencia,
            COUNT(DISTINCT huesped_id)::bigint as cantidad
          FROM todos_huespedes_procedencia
          GROUP BY pais_procedencia, ciudad_procedencia
          ORDER BY cantidad DESC
        `;

        const totalReservas = procedenciaData.reduce(
          (sum, item) => sum + Number(item.cantidad),
          0,
        );

        const resultado = procedenciaData.map((item) => ({
          paisProcedencia: item.pais_procedencia,
          ciudadProcedencia: item.ciudad_procedencia,
          cantidad: Number(item.cantidad),
          porcentaje: Number(
            ((Number(item.cantidad) / totalReservas) * 100).toFixed(2),
          ),
        }));

        // Guardar log de la analítica
        const duracionMs = Date.now() - startTime;
        await this.saveAnalyticsLog(
          'procedencia',
          filtros,
          resultado,
          duracionMs,
        );

        return resultado;
      }

      // Para filtros con fechas, usar query con JOIN a reservas
      const procedenciaData = await this.prisma.$queryRaw<
        Array<{
          pais_procedencia: string;
          ciudad_procedencia: string;
          cantidad: bigint;
        }>
      >`
        WITH procedencia_con_filtros AS (
          -- Procedencia de huéspedes principales con reservas que cumplen filtros
          SELECT DISTINCT
            COALESCE(h.pais_procedencia, 'No especificado') as pais_procedencia,
            COALESCE(h.ciudad_procedencia, 'No especificada') as ciudad_procedencia,
            h.id as huesped_id,
            'principal' as tipo_huesped
          FROM "Huesped" h
          JOIN "Reserva" r ON h.id = r."huespedId" AND r.deleted = false
          WHERE h.deleted = false
            ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
            ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
            ${paisesProcedencia && paisesProcedencia.length > 0 ? Prisma.sql`AND h.pais_procedencia = ANY(${paisesProcedencia})` : Prisma.empty}
          
          UNION
          
          -- Procedencia de huéspedes secundarios con reservas que cumplen filtros
          SELECT DISTINCT
            COALESCE(hs.pais_procedencia, 'No especificado') as pais_procedencia,
            COALESCE(hs.ciudad_procedencia, 'No especificada') as ciudad_procedencia,
            hs.id as huesped_id,
            'secundario' as tipo_huesped
          FROM "HuespedSecundario" hs
          JOIN "_HuespedSecundarioToReserva" hsr ON hs.id = hsr."A"
          JOIN "Reserva" r ON hsr."B" = r.id AND r.deleted = false
          WHERE hs.deleted = false
            ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
            ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
            ${paisesProcedencia && paisesProcedencia.length > 0 ? Prisma.sql`AND hs.pais_procedencia = ANY(${paisesProcedencia})` : Prisma.empty}
        )
        SELECT 
          pais_procedencia,
          ciudad_procedencia,
          COUNT(DISTINCT huesped_id)::bigint as cantidad
        FROM procedencia_con_filtros
        GROUP BY pais_procedencia, ciudad_procedencia
        ORDER BY cantidad DESC
      `;

      const totalReservas = procedenciaData.reduce(
        (sum, item) => sum + Number(item.cantidad),
        0,
      );

      const resultado = procedenciaData.map((item) => ({
        paisProcedencia: item.pais_procedencia,
        ciudadProcedencia: item.ciudad_procedencia,
        cantidad: Number(item.cantidad),
        porcentaje: Number(
          ((Number(item.cantidad) / totalReservas) * 100).toFixed(2),
        ),
      }));

      // Guardar log de la analítica
      const duracionMs = Date.now() - startTime;
      await this.saveAnalyticsLog(
        'procedencia',
        filtros,
        resultado,
        duracionMs,
      );

      return resultado;
    } catch (error) {
      const duracionMs = Date.now() - startTime;
      this.logger.error(
        `Error en analítica de procedencia (${duracionMs}ms): ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Analiza el rendimiento de las habitaciones
   * @param filtros Filtros para el análisis de habitaciones
   * @returns Análisis de rendimiento por tipo de habitación
   */
  async analizarRendimientoHabitaciones(
    filtros: FiltrosAnalyticsDto,
  ): Promise<RendimientoHabitacionDto[]> {
    const { fechaInicio, fechaFin, tipoHabitacion } = filtros;

    const rendimientoData = await this.prisma.$queryRaw<
      Array<{
        tipo: string;
        total_habitaciones: bigint;
        total_reservas: bigint;
        ingresos_totales: number;
        precio_promedio: number;
      }>
    >`
      SELECT 
        h.tipo::text as tipo,
        COUNT(DISTINCT h.id)::bigint as total_habitaciones,
        COUNT(DISTINCT r.id)::bigint as total_reservas,
        COALESCE(SUM(r.costo), 0) as ingresos_totales,
        COALESCE(AVG(h.precio_por_noche), 0) as precio_promedio
      FROM "Habitacion" h
      LEFT JOIN "Reserva" r ON h.id = r."habitacionId" AND r.deleted = false
        ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
        ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
      WHERE h.deleted = false
        ${tipoHabitacion ? Prisma.sql`AND h.tipo::text = ${tipoHabitacion}` : Prisma.empty}
      GROUP BY h.tipo
      ORDER BY ingresos_totales DESC
    `;

    return rendimientoData.map((item) => {
      const totalHabitaciones = Number(item.total_habitaciones);
      const totalReservas = Number(item.total_reservas);
      const ingresosTotales = item.ingresos_totales || 0;
      const precioPromedioNoche = item.precio_promedio || 0;

      // Calcular tasa de ocupación simplificada
      const tasaOcupacionPromedio =
        totalHabitaciones > 0 ? (totalReservas / totalHabitaciones) * 100 : 0;

      // Calcular RevPAR
      const revpar = (tasaOcupacionPromedio / 100) * precioPromedioNoche;

      return {
        tipo: item.tipo as any,
        totalHabitaciones,
        tasaOcupacionPromedio: Number(tasaOcupacionPromedio.toFixed(2)),
        ingresosTotales: Number(ingresosTotales.toFixed(2)),
        precioPromedioNoche: Number(precioPromedioNoche.toFixed(2)),
        revpar: Number(revpar.toFixed(2)),
      };
    });
  }

  /**
   * Analiza los motivos de viaje
   * @param filtros Filtros para el análisis de motivos
   * @returns Análisis de motivos de viaje
   */
  async analizarMotivosViaje(
    filtros: FiltrosAnalyticsDto,
  ): Promise<MotivosViajeDto[]> {
    const { fechaInicio, fechaFin, motivoViaje } = filtros;

    const motivosData = await this.prisma.$queryRaw<
      Array<{
        motivo_viaje: string;
        cantidad: bigint;
        duracion_promedio: number;
      }>
    >`
      SELECT 
        r.motivo_viaje,
        COUNT(*)::bigint as cantidad,
        AVG(EXTRACT(EPOCH FROM (r.fecha_fin - r.fecha_inicio)) / 86400) as duracion_promedio
      FROM "Reserva" r
      WHERE r.deleted = false
        ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
        ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
        ${motivoViaje ? Prisma.sql`AND r.motivo_viaje = ${motivoViaje}` : Prisma.empty}
      GROUP BY r.motivo_viaje
      ORDER BY cantidad DESC
    `;

    const totalReservas = motivosData.reduce(
      (sum, item) => sum + Number(item.cantidad),
      0,
    );

    return motivosData.map((item) => ({
      motivo: item.motivo_viaje as any,
      cantidad: Number(item.cantidad),
      porcentaje: Number(
        ((Number(item.cantidad) / totalReservas) * 100).toFixed(2),
      ),
      duracionPromedioEstancia: Number(
        (item.duracion_promedio || 0).toFixed(1),
      ),
    }));
  }

  /**
   * Genera predicción básica de ocupación
   * @param parametros Parámetros para la predicción
   * @returns Predicción de ocupación
   */
  async predecirOcupacion(
    parametros: ForecastParamsDto,
  ): Promise<PrediccionOcupacionDto[]> {
    const { fechaInicio, fechaFin, periodosAdelante, tipoPeriodo } = parametros;

    // Usar la misma función que funciona en calcularOcupacion
    const dateFunction = this.getDateTruncFunction(
      tipoPeriodo === 'mes' ? 'mes' : 'semana',
    );

    const datosHistoricos = await this.prisma.$queryRaw<
      Array<{
        periodo: string;
        ocupacion_promedio: number;
        ingresos_promedio: number;
      }>
    >`
      SELECT 
        ${dateFunction} as periodo,
        COUNT(*)::float / (SELECT COUNT(*) FROM "Habitacion" WHERE deleted = false) * 100 as ocupacion_promedio,
        AVG(costo) as ingresos_promedio
      FROM "Reserva"
      WHERE deleted = false
        ${fechaInicio ? Prisma.sql`AND fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
        ${fechaFin ? Prisma.sql`AND fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
      GROUP BY ${dateFunction}
      ORDER BY periodo DESC
      LIMIT 12
    `;

    // Calcular promedios para la predicción
    const ocupacionPromedio =
      datosHistoricos.reduce((sum, item) => sum + item.ocupacion_promedio, 0) /
      (datosHistoricos.length || 1);

    const ingresosPromedio =
      datosHistoricos.reduce((sum, item) => sum + item.ingresos_promedio, 0) /
      (datosHistoricos.length || 1);

    // Generar predicciones futuras
    const predicciones: PrediccionOcupacionDto[] = [];
    const fechaBase = new Date();

    for (let i = 1; i <= periodosAdelante; i++) {
      const fechaPrediccion = new Date(fechaBase);
      if (tipoPeriodo === 'mes') {
        fechaPrediccion.setMonth(fechaPrediccion.getMonth() + i);
      } else {
        fechaPrediccion.setDate(fechaPrediccion.getDate() + i * 7);
      }

      // Aplicar variabilidad estacional simple
      const factorEstacional = 1 + Math.sin(i * Math.PI * 2) * 0.15;
      const ocupacionPredicida = ocupacionPromedio * factorEstacional;
      const ingresosPredichos = ingresosPromedio * factorEstacional;

      predicciones.push({
        periodo: fechaPrediccion.toISOString().substr(0, 7),
        ocupacionPredicida: Number(ocupacionPredicida.toFixed(2)),
        nivelConfianza: Math.max(50, 95 - i * 5), // Reducir confianza con el tiempo
        ingresosPredichos: Number(ingresosPredichos.toFixed(2)),
      });
    }

    return predicciones;
  }

  /**
   * Genera el dashboard ejecutivo con KPIs principales
   * @param filtros Filtros para el dashboard
   * @returns Dashboard ejecutivo completo
   */
  async generarDashboard(
    filtros: FiltrosDashboardDto,
  ): Promise<DashboardEjecutivoDto> {
    const {
      fechaInicio,
      fechaFin,
      incluirComparacion,
      topMercados = 5,
    } = filtros;

    // Ejecutar múltiples consultas en paralelo para optimizar performance
    const [
      ocupacionData,
      demografiaData,
      motivosData,
      rendimientoData,
      huespedesRecurrentesData,
    ] = await Promise.all([
      this.calcularOcupacion({ fechaInicio, fechaFin }),
      this.analizarDemografia({ fechaInicio, fechaFin }),
      this.analizarMotivosViaje({ fechaInicio, fechaFin }),
      this.analizarRendimientoHabitaciones({ fechaInicio, fechaFin }),
      this.calcularHuespedesRecurrentes({ fechaInicio, fechaFin }),
    ]);

    // KPIs principales del período actual
    const ocupacionActual = ocupacionData.ocupacionPromedio;
    const revparActual = ocupacionData.revparPromedio;
    const adrActual = ocupacionData.adrPromedio;
    const ingresosPeriodo = ocupacionData.ocupacionPorPeriodo.reduce(
      (sum, item) => sum + item.ingresosTotales,
      0,
    );

    const dashboard: DashboardEjecutivoDto = {
      ocupacionActual,
      revparActual,
      adrActual,
      ingresosPeriodo,
      topMercadosEmisores: demografiaData.slice(0, topMercados),
      distribucionMotivosViaje: motivosData,
      rendimientoHabitaciones: rendimientoData,
      tasaHuespedesRecurrentes: huespedesRecurrentesData,
    };

    // Agregar comparación con período anterior si se solicita
    if (incluirComparacion && fechaInicio && fechaFin) {
      const periodoAnterior = this.calcularPeriodoAnterior(
        fechaInicio,
        fechaFin,
      );
      const datosAnteriores = await this.calcularOcupacion(periodoAnterior);

      dashboard.comparacionPeriodoAnterior = {
        ocupacionAnterior: datosAnteriores.ocupacionPromedio,
        revparAnterior: datosAnteriores.revparPromedio,
        adrAnterior: datosAnteriores.adrPromedio,
        ingresosAnteriores: datosAnteriores.ocupacionPorPeriodo.reduce(
          (sum, item) => sum + item.ingresosTotales,
          0,
        ),
        cambioOcupacion: Number(
          (
            ((ocupacionActual - datosAnteriores.ocupacionPromedio) /
              datosAnteriores.ocupacionPromedio) *
            100
          ).toFixed(2),
        ),
        cambioRevpar: Number(
          (
            ((revparActual - datosAnteriores.revparPromedio) /
              datosAnteriores.revparPromedio) *
            100
          ).toFixed(2),
        ),
        cambioAdr: Number(
          (
            ((adrActual - datosAnteriores.adrPromedio) /
              datosAnteriores.adrPromedio) *
            100
          ).toFixed(2),
        ),
        cambioIngresos: Number(
          (
            ((ingresosPeriodo -
              datosAnteriores.ocupacionPorPeriodo.reduce(
                (sum, item) => sum + item.ingresosTotales,
                0,
              )) /
              datosAnteriores.ocupacionPorPeriodo.reduce(
                (sum, item) => sum + item.ingresosTotales,
                0,
              )) *
            100
          ).toFixed(2),
        ),
      };
    }

    return dashboard;
  }

  /**
   * Calcula la tasa de huéspedes recurrentes
   * @param filtros Filtros para el cálculo
   * @returns Porcentaje de huéspedes recurrentes
   */
  private async calcularHuespedesRecurrentes(filtros: {
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<number> {
    const { fechaInicio, fechaFin } = filtros;

    const huespedesRecurrentes = await this.prisma.$queryRaw<
      Array<{ total_huespedes: bigint; huespedes_recurrentes: bigint }>
    >`
      WITH huespedes_con_reservas AS (
        SELECT 
          h.id,
          COUNT(r.id) as total_reservas
        FROM "Huesped" h
        LEFT JOIN "Reserva" r ON h.id = r."huespedId" AND r.deleted = false
          ${fechaInicio ? Prisma.sql`AND r.fecha_inicio >= ${new Date(fechaInicio)}` : Prisma.empty}
          ${fechaFin ? Prisma.sql`AND r.fecha_fin <= ${new Date(fechaFin)}` : Prisma.empty}
        WHERE h.deleted = false
        GROUP BY h.id
      )
      SELECT 
        COUNT(*)::bigint as total_huespedes,
        COUNT(CASE WHEN total_reservas > 1 THEN 1 END)::bigint as huespedes_recurrentes
      FROM huespedes_con_reservas
    `;

    const data = huespedesRecurrentes[0];
    const totalHuespedes = Number(data?.total_huespedes || 0);
    const recurrentes = Number(data?.huespedes_recurrentes || 0);

    return totalHuespedes > 0
      ? Number(((recurrentes / totalHuespedes) * 100).toFixed(2))
      : 0;
  }

  /**
   * Obtiene la función SQL de truncamiento de fecha según el período
   * @param periodo Período de agrupación
   * @returns Función SQL de truncamiento
   */
  private getDateTruncFunction(
    periodo: 'día' | 'semana' | 'mes' | 'año',
  ): Prisma.Sql {
    switch (periodo) {
      case 'día':
        return Prisma.sql`DATE_TRUNC('day', fecha_inicio)`;
      case 'semana':
        return Prisma.sql`DATE_TRUNC('week', fecha_inicio)`;
      case 'mes':
        return Prisma.sql`DATE_TRUNC('month', fecha_inicio)`;
      case 'año':
        return Prisma.sql`DATE_TRUNC('year', fecha_inicio)`;
      default:
        return Prisma.sql`DATE_TRUNC('month', fecha_inicio)`;
    }
  }

  /**
   * Calcula el período anterior basado en las fechas dadas
   * @param fechaInicio Fecha de inicio del período actual
   * @param fechaFin Fecha de fin del período actual
   * @returns Objeto con fechas del período anterior
   */
  private calcularPeriodoAnterior(
    fechaInicio: string,
    fechaFin: string,
  ): { fechaInicio: string; fechaFin: string } {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const duracion = fin.getTime() - inicio.getTime();

    const inicioAnterior = new Date(inicio.getTime() - duracion);
    const finAnterior = new Date(inicio.getTime() - 1);

    return {
      fechaInicio: inicioAnterior.toISOString().split('T')[0],
      fechaFin: finAnterior.toISOString().split('T')[0],
    };
  }
}
