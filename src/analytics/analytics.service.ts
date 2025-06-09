import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  FiltrosAnalyticsDto,
  FiltrosOcupacionDto,
  FiltrosDashboardDto,
  ForecastParamsDto,
  FiltrosFinancierosDto,
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
  DashboardFinancieroDto,
  InformacionFinancieraPorPeriodoDto,
} from './dto/response-analytics.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';
import { AgrupamientoFactory } from './strategies/agrupamiento.factory';

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
   * Calcula la ocupación del hotel por períodos usando el patrón Strategy
   * @param filtros Filtros para la consulta de ocupación
   * @returns Análisis detallado de ocupación con todos los períodos incluidos (incluye períodos sin reservas)
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

    // Convertir fechas a objetos Date (o usar rangos amplios si no se proporcionan)
    const fechaInicioObj = fechaInicio
      ? new Date(fechaInicio)
      : new Date('1900-01-01');
    const fechaFinObj = fechaFin ? new Date(fechaFin) : new Date('9999-12-31');

    // Crear la estrategia de agrupamiento apropiada
    const strategy = AgrupamientoFactory.create(agruparPor);

    // Construir y ejecutar la consulta SQL usando la estrategia
    const sqlQuery = strategy.buildSql(
      fechaInicioObj,
      fechaFinObj,
      tipoHabitacion,
    );

    const ocupacionPorPeriodoRaw = await this.prisma.$queryRaw<
      Array<{
        periodo: string;
        habitaciones_ocupadas: bigint;
        total_reservas: bigint;
        ingresos_totales: number;
      }>
    >`${Prisma.raw(sqlQuery)}`;

    // Obtener el número total de habitaciones activas (deleted = false), opcionalmente por tipo
    const totalHabitaciones = await this.prisma.habitacion.count({
      where: {
        deleted: false,
        ...(tipoHabitacion && { tipo: tipoHabitacion }),
      },
    });

    // Auxiliar para saber cuántos días tiene cada período
    function obtenerDiasEnPeriodo(
      periodoStr: string,
      tipoAgrupacion: string,
    ): number {
      const fecha = new Date(periodoStr);
      switch (tipoAgrupacion) {
        case 'día':
          return 1;
        case 'semana':
          return 7;
        case 'mes':
          const yearM = fecha.getUTCFullYear();
          const monthM = fecha.getUTCMonth();
          return new Date(Date.UTC(yearM, monthM + 1, 0)).getUTCDate();
        case 'año':
          const yearA = fecha.getUTCFullYear();
          const esBisiesto =
            (yearA % 4 === 0 && yearA % 100 !== 0) || yearA % 400 === 0;
          return esBisiesto ? 366 : 365;
        default:
          return 1;
      }
    }

    // Procesar resultados usando la nueva lógica
    const datosOcupacion: OcupacionPorPeriodoDto[] = ocupacionPorPeriodoRaw.map(
      (item) => {
        const totalReservas = Number(item.total_reservas);
        const ingresosTotales = Number(item.ingresos_totales) || 0;

        // nochesOcupadas ahora es el número de habitaciones ocupadas (habitaciones_ocupadas)
        const nochesOcupadas = Number(item.habitaciones_ocupadas) || 0;

        // ADR = ingresos_totales / nochesOcupadas (si no hay noches ocupadas, ADR = 0)
        const adr = nochesOcupadas > 0 ? ingresosTotales / nochesOcupadas : 0;

        // Días que comprende este período
        const diasEnPeriodo = obtenerDiasEnPeriodo(item.periodo, agruparPor);

        // Tasa de ocupación = (nochesOcupadas) / (totalHabitaciones × díasEnPeriodo) × 100
        const tasaOcupacion =
          totalHabitaciones > 0
            ? (nochesOcupadas / (totalHabitaciones * diasEnPeriodo)) * 100
            : 0;

        // RevPAR = ADR × (tasaOcupacion / 100)
        const revpar = (tasaOcupacion / 100) * adr;

        return {
          periodo: item.periodo,
          totalReservas,
          ingresosTotales: Number(ingresosTotales.toFixed(2)),
          nochesOcupadas: Number(nochesOcupadas.toFixed(2)),
          adr: Number(adr.toFixed(2)),
          tasaOcupacion: Number(tasaOcupacion.toFixed(2)),
          revpar: Number(revpar.toFixed(2)),
        };
      },
    );

    // Promedios generales
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
    const { fechaInicio, fechaFin, nacionalidades, motivoViaje } = filtros;

    try {
      // Primero, validamos las fechas: si vienen definidas, convertimos a objeto Date y
      // nos aseguramos de que estén en UTC, para evitar desajustes con la DB (zona America/Bogotá).
      let fechaInicioDate: Date | null = null;
      let fechaFinDate: Date | null = null;

      if (fechaInicio) {
        const tmp = new Date(fechaInicio);
        if (isNaN(tmp.getTime())) {
          throw new Error(`fechaInicio inválida: ${fechaInicio}`);
        }
        fechaInicioDate = new Date(
          Date.UTC(
            tmp.getUTCFullYear(),
            tmp.getUTCMonth(),
            tmp.getUTCDate(),
            0,
            0,
            0,
          ),
        );
      }
      if (fechaFin) {
        const tmp = new Date(fechaFin);
        if (isNaN(tmp.getTime())) {
          throw new Error(`fechaFin inválida: ${fechaFin}`);
        }
        // Para incluir todo el día de fechaFin, lo llevamos a 23:59:59 UTC
        fechaFinDate = new Date(
          Date.UTC(
            tmp.getUTCFullYear(),
            tmp.getUTCMonth(),
            tmp.getUTCDate(),
            23,
            59,
            59,
          ),
        );
      }

      // Convertimos motivoViaje a minúsculas para comparar case-insensitive contra el enum en la BD
      const motivoNormalized = motivoViaje
        ? String(motivoViaje).trim().toLowerCase()
        : null;

      // Construimos la parte condicional de SQL para los filtros de fecha y motivo,
      // usando Prisma.sql para evitar inyección de SQL.
      const whereFechaInicio = fechaInicioDate
        ? Prisma.sql`AND r.fecha_inicio >= ${fechaInicioDate}`
        : Prisma.empty;
      const whereFechaFin = fechaFinDate
        ? Prisma.sql`AND r.fecha_fin <= ${fechaFinDate}`
        : Prisma.empty;
      const whereMotivo = motivoNormalized
        ? // comparamos en minúsculas: r.motivo_viaje::text → string de DB; lo igualamos a LOWER(motivoNormalized)
          Prisma.sql`AND LOWER(r.motivo_viaje::text) = ${motivoNormalized}`
        : Prisma.empty;
      const whereNacionalidadPrincipal =
        nacionalidades && nacionalidades.length > 0
          ? Prisma.sql`AND LOWER(h.nacionalidad) = ANY(ARRAY[${Prisma.join(
              nacionalidades.map((n) => n.toLowerCase()),
            )}]::text[])`
          : Prisma.empty;
      const whereNacionalidadSecundario =
        nacionalidades && nacionalidades.length > 0
          ? Prisma.sql`AND LOWER(hs.nacionalidad) = ANY(ARRAY[${Prisma.join(
              nacionalidades.map((n) => n.toLowerCase()),
            )}]::text[])`
          : Prisma.empty;

      // =========================
      // Construcción de la consulta
      // =========================
      //
      // Vamos a unificar ambos casos (con o sin filtros) en una misma lógica,
      // de forma que SIEMPRE consideremos únicamente aquellos huéspedes (principales
      // o secundarios) que hayan tenido al menos una reserva activa que cumpla condiciones
      // (en el caso "sin filtros", no habrá cláusulas WHERE adicionales y por tanto
      // se incluirán todos los que tengan alguna reserva).
      //
      // Además:
      //  - Eliminamos la doble atribución de ingresos a secundarios. Sólo atribuiremos
      //    el costo de cada reserva al huésped principal "huespedId". A los secundarios
      //    los contaremos para efectos de demografía (cantidad) pero no les sumaremos
      //    el costo de la reserva completa (esto evita duplicación de ingresos).
      //  - Conservamos un UNION para combinar "principales" y "secundarios", pero
      //    etiquetamos cada uno con un campo `tipo_huesped` para evitar colisión de IDs.
      //  - Garantizamos que al hacer el JOIN de ingresos, la combinación ocurra por
      //    `(huesped_id, tipo_huesped)` en lugar de solo por `huesped_id`.
      //  - Controlamos el caso en que el resultado sea vacío para evitar división por cero.
      //
      //   CTE1: huéspedes (principales + secundarios) que cumplen filtros de reserva
      //   CTE2: ingresos solo para huéspedes principales (las reservas que cumplan)
      //   Consulta final: agrupamos por nacionalidad y sumamos cantidad + ingresos
      //
      const demografiaData = await this.prisma.$queryRaw<
        Array<{
          nacionalidad: string;
          tipo_huesped: string;
          cantidad: bigint;
          ingresos: number;
        }>
      >`
      WITH
      -- 1) Tomamos TODOS los huéspedes principales que tengan al menos una reserva activa
      --    que cumpla los filtros (fechaInicio/fechaFin/motivo), filtrando por nacionalidad
      huespedes_principales_filtrados AS (
        SELECT DISTINCT
          LOWER(h.nacionalidad) AS nacionalidad,
          h.id AS huesped_id,
          'principal' AS tipo_huesped
        FROM "Huesped" h
        JOIN "Reserva" r
          ON h.id = r."huespedId"
         AND r.deleted = false
        WHERE h.deleted = false
          ${whereFechaInicio}
          ${whereFechaFin}
          ${whereMotivo}
          ${whereNacionalidadPrincipal}
      ),

      -- 2) Tomamos TODOS los huéspedes secundarios que participen en al menos
      --    una reserva activa que cumpla los mismos filtros, filtrando por SQL.
      huespedes_secundarios_filtrados AS (
        SELECT DISTINCT
          LOWER(hs.nacionalidad) AS nacionalidad,
          hs.id AS huesped_id,
          'secundario' AS tipo_huesped
        FROM "HuespedSecundario" hs
        JOIN "_HuespedSecundarioToReserva" hsr
          ON hs.id = hsr."A"
        JOIN "Reserva" r
          ON hsr."B" = r.id
         AND r.deleted = false
        WHERE hs.deleted = false
          ${whereFechaInicio}
          ${whereFechaFin}
          ${whereMotivo}
          ${whereNacionalidadSecundario}
      ),

      -- 3) Ingresos atribuibles SOLO a huéspedes principales:
      --    sumamos r.costo POR CADA huespedId (principal) que cumpla filtros
      ingresos_huesped_principal AS (
        SELECT
          h.id AS huesped_id,
          'principal' AS tipo_huesped,
          SUM(r.costo)::numeric(12,2) AS total_ingresos
        FROM "Huesped" h
        JOIN "Reserva" r
          ON h.id = r."huespedId"
         AND r.deleted = false
        WHERE h.deleted = false
          ${whereFechaInicio}
          ${whereFechaFin}
          ${whereMotivo}
          -- Ya no necesitamos filtrar por nacionalidad aquí porque en la unión
          -- final los huéspedes que no estén en CTE1 no entrarán.
        GROUP BY h.id
      )

      -- 4) Unión final de huéspedes (principales + secundarios):
      --    cada fila representa un huésped único (por nationality + tipo)
      --    JOIN  LEFT  con los ingresos solo para "principales"
      SELECT
        hp.nacionalidad,
        hp.tipo_huesped,
        COUNT(*)::bigint AS cantidad,
        COALESCE(SUM(ihp.total_ingresos), 0)::numeric(12,2) AS ingresos
      FROM (
        SELECT * FROM huespedes_principales_filtrados
        UNION
        SELECT * FROM huespedes_secundarios_filtrados
      ) hp
      LEFT JOIN ingresos_huesped_principal ihp
        ON hp.huesped_id = ihp.huesped_id
       AND hp.tipo_huesped = ihp.tipo_huesped
      GROUP BY hp.nacionalidad, hp.tipo_huesped
      ORDER BY cantidad DESC, ingresos DESC;
    `;

      // A esta altura, demografiaData tiene la forma:
      // [
      //   { nacionalidad: 'colombia', tipo_huesped: 'principal', cantidad: BigInt, ingresos: Number },
      //   { nacionalidad: 'colombia', tipo_huesped: 'secundario', cantidad: BigInt, ingresos: 0 },
      //   { nacionalidad: 'ecuador', tipo_huesped: 'principal', cantidad: BigInt, ingresos: Number },
      //   … etc.
      // ]
      //
      // Lo que queremos como salida final es, POR CADA nacionalidad (independientemente
      // de "principal" o "secundario"), sumar la cantidad total (principales + secundarios)
      // y sumar los ingresos (solo los de tipo 'principal'; los de 'secundario' vienen en 0)
      // para luego calcular porcentaje y retornar un array de DemografiaHuespedesDto.

      // 1) Primero, agrupamos en memoria por nacionalidad:
      interface Intermedio {
        nacionalidad: string;
        cantidad: number;
        ingresos: number;
      }
      const mapaIntermedio: Record<string, Intermedio> = {};

      for (const fila of demografiaData) {
        const nat = fila.nacionalidad;
        const cnt = Number(fila.cantidad);
        const ing = Number(fila.ingresos);

        if (!mapaIntermedio[nat]) {
          mapaIntermedio[nat] = {
            nacionalidad: nat,
            cantidad: 0,
            ingresos: 0,
          };
        }
        mapaIntermedio[nat].cantidad += cnt;
        mapaIntermedio[nat].ingresos += ing;
      }

      // 2) Calculamos el total global de huéspedes (de todas las nacionalidades)
      const totalHuespedes = Object.values(mapaIntermedio).reduce(
        (sum, item) => sum + item.cantidad,
        0,
      );

      // 3) Construimos el resultado final, ordenando por cantidad DESC y luego por ingresos DESC:
      const resultado: DemografiaHuespedesDto[] = Object.values(mapaIntermedio)
        .map((item) => ({
          nacionalidad: item.nacionalidad,
          cantidad: item.cantidad,
          porcentaje:
            totalHuespedes === 0
              ? 0.0
              : Number(((item.cantidad / totalHuespedes) * 100).toFixed(2)),
          ingresos: Number(item.ingresos.toFixed(2)),
        }))
        .sort((a, b) => {
          // orden descendente por cantidad, luego por ingresos
          if (b.cantidad !== a.cantidad) {
            return b.cantidad - a.cantidad;
          }
          return b.ingresos - a.ingresos;
        });

      return resultado;
    } catch (error) {
      this.logger.error(`Error en analítica de demografía: ${error.message}`);
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
   * Analiza la rentabilidad de cada habitación individual
   * @param filtros Filtros para el análisis (fechaInicio, fechaFin, tipoHabitacion)
   * @returns Un listado de habitaciones (número + tipo) ordenadas por ingresos totales en el periodo,
   *          con sus métricas: ingresos, reservas, noches vendidas, ingreso promedio por reserva y ocupación (%).
   */
  async analizarRendimientoHabitaciones(
    filtros: FiltrosAnalyticsDto,
  ): Promise<RendimientoHabitacionDto[]> {
    const { fechaInicio, fechaFin, tipoHabitacion } = filtros;

    // Convertimos a fechas JavaScript (asumiendo que vienen como strings ISO o similares)
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;

    // Obtenemos la cantidad de días del periodo (inclusive)
    let diasPeriodo = 0;
    if (inicio && fin) {
      // +1 para incluir ambos extremos (si inicio = 2025-06-01 y fin = 2025-06-05, queremos 5 días)
      diasPeriodo =
        Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
    }

    const rendimientoData = await this.prisma.$queryRaw<
      Array<{
        habitacion_id: string;
        numero_habitacion: string;
        tipo: string;
        ingresos_totales: number;
        total_reservas: bigint;
        noches_vendidas: number;
      }>
    >`
    SELECT
      h.id                             AS habitacion_id,
      h.numero_habitacion              AS numero_habitacion,
      h.tipo::text                     AS tipo,

      -- Ingresos totales de esa habitación en reservas que tocan el periodo
      COALESCE(SUM(r.costo), 0)        AS ingresos_totales,

      -- Número de reservas distintas que intersectan el periodo
      COUNT(DISTINCT r.id)::bigint      AS total_reservas,

      -- Sumar la cantidad de noches efectivas (intersección de cada reserva con el periodo)
      COALESCE(
        SUM(
          /* 
            Calculamos, para cada reserva r, cuántos días (noches) entra dentro de [inicio, fin]:
            - LEAST(r.fecha_fin, fin) y GREATEST(r.fecha_inicio, inicio) nos dan la parte de la reserva que está dentro.
            - DATE_PART('day', diferencia) + 1  cuenta inclusive las noches.
            - GREATEST(..., 1) garantiza que reservas menores a un día cuenten como 1 noche mínimo.
            - CASE WHEN r.id IS NOT NULL: Solo cuenta si hay una reserva válida (evita contar cuando no hay reservas)
          */
          CASE 
            WHEN r.id IS NOT NULL THEN
              GREATEST(
                (
                  DATE_PART(
                    'day',
                    LEAST(r.fecha_fin,   ${fin}) 
                    - GREATEST(r.fecha_inicio, ${inicio})
                  )
                ) + 1,
                1
              )
            ELSE 0
          END
        ),
        0
      )                                 AS noches_vendidas

    FROM "Habitacion" h
    LEFT JOIN "Reserva" r
      ON h.id = r."habitacionId"
      AND r.deleted = false

      -- Para "tocar" el periodo, la reserva debe empezar antes o en fin, 
      -- y terminar después o en inicio
      ${
        inicio && fin
          ? Prisma.sql`AND r.fecha_inicio <= ${fin} AND r.fecha_fin >= ${inicio}`
          : Prisma.empty
      }

    WHERE h.deleted = false
      ${
        tipoHabitacion
          ? Prisma.sql`AND h.tipo::text = ${tipoHabitacion}`
          : Prisma.empty
      }

    GROUP BY
      h.id, h.numero_habitacion, h.tipo

    ORDER BY ingresos_totales DESC
  `;

    return rendimientoData.map((row) => {
      const ingresosTotales = Number(row.ingresos_totales || 0);
      const totalReservas = Number(row.total_reservas);
      const nochesVendidas = Number(row.noches_vendidas || 0);

      // Ingreso promedio por reserva (evitar división por cero)
      const ingresoPromedioPorReserva =
        totalReservas > 0 ? ingresosTotales / totalReservas : 0;

      // Ocupación porcentual simplificada: (noches vendidas) / (días totales del periodo) * 100
      const porcentajeOcupacion =
        diasPeriodo > 0 ? (nochesVendidas / diasPeriodo) * 100 : 0;

      return {
        habitacionId: row.habitacion_id,
        numeroHabitacion: row.numero_habitacion,
        tipo: row.tipo,
        ingresosTotales: Number(ingresosTotales.toFixed(2)),
        totalReservas: totalReservas,
        nochesVendidas: nochesVendidas,
        ingresoPromedioReserva: Number(ingresoPromedioPorReserva.toFixed(2)),
        porcentajeOcupacion: Number(porcentajeOcupacion.toFixed(2)),
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
        AVG(
          GREATEST(
            EXTRACT(EPOCH FROM (r.fecha_fin - r.fecha_inicio)) / 86400,
            1
          )
        ) as duracion_promedio
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

    if (totalReservas === 0) {
      // Retornar lista vacía o bien con motivo y porcentaje = 0
      return motivosData.map((item) => ({
        motivo: item.motivo_viaje as MotivosViajes,
        cantidad: Number(item.cantidad),
        porcentaje: 0,
        duracionPromedioEstancia: Number(
          (item.duracion_promedio || 0).toFixed(1),
        ),
      }));
    }

    return motivosData.map((item) => ({
      motivo: item.motivo_viaje as MotivosViajes,
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

    // Usar función de truncamiento directa
    const dateFunction =
      tipoPeriodo === 'mes'
        ? Prisma.sql`DATE_TRUNC('month', fecha_inicio)`
        : Prisma.sql`DATE_TRUNC('week', fecha_inicio)`;

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
      agruparPor,
    } = filtros;

    // Ejecutar múltiples consultas en paralelo para optimizar performance
    const [
      ocupacionData,
      demografiaData,
      motivosData,
      rendimientoData,
      huespedesRecurrentesData,
    ] = await Promise.all([
      this.calcularOcupacion({ fechaInicio, fechaFin, agruparPor }),
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
        agruparPor,
      );
      const datosAnteriores = await this.calcularOcupacion({
        ...periodoAnterior,
        agruparPor,
      });

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

    // 1) Validar que, si vienen fechas, sean cadenas ISO válidas
    if (fechaInicio && isNaN(Date.parse(fechaInicio))) {
      throw new Error(
        `fechaInicio inválida: "${fechaInicio}" no es una fecha ISO reconocida`,
      );
    }
    if (fechaFin && isNaN(Date.parse(fechaFin))) {
      throw new Error(
        `fechaFin inválida: "${fechaFin}" no es una fecha ISO reconocida`,
      );
    }

    /**
     * 2) Uso de SQL crudo con tres correcciones principales:
     *    a) Cambiamos la lógica de filtrado de fechas para que incluya reservas que se solapen con el rango:
     *         ‣ r.fecha_fin   >= fechaInicio
     *         ‣ r.fecha_inicio <= fechaFin
     *    b) Pasamos las cadenas (YYYY-MM-DD) directamente al SQL con ::date para evitar despistes de zona horaria.
     *    c) Ajustamos el conteo para que el denominador ("total_huespedes") sólo considere huéspedes
     *       que tengan al menos UNA reserva en el rango dado, de modo que la tasa se mida "entre quienes reservaron".
     */
    const huespedesRecurrentes = await this.prisma.$queryRaw<
      Array<{ total_huespedes: bigint; huespedes_recurrentes: bigint }>
    >`
    WITH huespedes_con_reservas AS (
      SELECT
        h.id,
        COUNT(r.id) AS total_reservas
      FROM "Huesped" h
      LEFT JOIN "Reserva" r
        ON h.id = r."huespedId"
        AND r.deleted = false
        ${
          fechaInicio
            ? Prisma.sql`AND r.fecha_fin >= ${fechaInicio}::date`
            : Prisma.empty
        }
        ${
          fechaFin
            ? Prisma.sql`AND r.fecha_inicio <= ${fechaFin}::date`
            : Prisma.empty
        }
      WHERE h.deleted = false
      GROUP BY h.id
    )
    SELECT
      -- Sólo contamos huéspedes que tengan al menos 1 reserva en el rango
      COUNT(*) FILTER (WHERE total_reservas >= 1)::bigint   AS total_huespedes,
      -- Cuántos de esos tienen más de una reserva
      COUNT(*) FILTER (WHERE total_reservas > 1)::bigint     AS huespedes_recurrentes
    FROM huespedes_con_reservas
  `;

    const data = huespedesRecurrentes[0] ?? {
      total_huespedes: BigInt(0),
      huespedes_recurrentes: BigInt(0),
    };
    const totalHuespedes = Number(data.total_huespedes);
    const recurrentes = Number(data.huespedes_recurrentes);

    // Si no hay huéspedes que hayan reservado en el período, devolvemos 0
    if (totalHuespedes === 0) {
      return 0;
    }

    // Calculamos el porcentaje con dos decimales
    const porcentaje = (recurrentes / totalHuespedes) * 100;
    return Number(porcentaje.toFixed(2));
  }

  /**
   * Calcula el período anterior basado en las fechas dadas y el tipo de agrupación
   * @param fechaInicio Fecha de inicio del período actual
   * @param fechaFin Fecha de fin del período actual
   * @param agruparPor Tipo de período para cálculo inteligente (opcional, por defecto usa duración simple)
   * @returns Objeto con fechas del período anterior
   */
  private calcularPeriodoAnterior(
    fechaInicio: string,
    fechaFin: string,
    agruparPor?: 'día' | 'semana' | 'mes' | 'año',
  ): { fechaInicio: string; fechaFin: string } {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    let inicioAnterior: Date;
    let finAnterior: Date;

    if (agruparPor) {
      // Cálculo inteligente basado en el tipo de período
      switch (agruparPor) {
        case 'día':
          // Para días, usar la duración simple
          const duracionDias = fin.getTime() - inicio.getTime();
          inicioAnterior = new Date(inicio.getTime() - duracionDias);
          finAnterior = new Date(inicioAnterior.getTime() + duracionDias);
          break;

        case 'semana':
          // Para semanas, retroceder el mismo número de semanas
          const semanas = Math.ceil(
            (fin.getTime() - inicio.getTime()) / (7 * 24 * 60 * 60 * 1000),
          );
          inicioAnterior = new Date(inicio);
          inicioAnterior.setDate(inicioAnterior.getDate() - semanas * 7);
          finAnterior = new Date(fin);
          finAnterior.setDate(finAnterior.getDate() - semanas * 7);
          break;

        case 'mes':
          // Para meses, ir al mismo período del mes anterior
          inicioAnterior = new Date(inicio);
          finAnterior = new Date(fin);

          // Calcular cuántos meses cubren el período
          const mesesDiferencia =
            (fin.getFullYear() - inicio.getFullYear()) * 12 +
            (fin.getMonth() - inicio.getMonth());
          const mesesARetroceder = Math.max(1, mesesDiferencia + 1);

          inicioAnterior.setMonth(inicioAnterior.getMonth() - mesesARetroceder);
          finAnterior.setMonth(finAnterior.getMonth() - mesesARetroceder);
          break;

        case 'año':
          // Para años, ir al mismo período del año anterior
          inicioAnterior = new Date(inicio);
          finAnterior = new Date(fin);

          // Calcular cuántos años cubren el período
          const añosDiferencia = fin.getFullYear() - inicio.getFullYear();
          const añosARetroceder = Math.max(1, añosDiferencia + 1);

          inicioAnterior.setFullYear(
            inicioAnterior.getFullYear() - añosARetroceder,
          );
          finAnterior.setFullYear(finAnterior.getFullYear() - añosARetroceder);
          break;
      }
    } else {
      // Fallback: usar duración simple (comportamiento anterior)
      const duracion = fin.getTime() - inicio.getTime();
      inicioAnterior = new Date(inicio.getTime() - duracion);
      finAnterior = new Date(inicioAnterior.getTime() + duracion);
    }

    return {
      fechaInicio: inicioAnterior.toISOString().split('T')[0],
      fechaFin: finAnterior.toISOString().split('T')[0],
    };
  }

  /**
   * Genera un dashboard financiero basado en facturas
   * @param filtros Filtros para el dashboard financiero
   * @returns Dashboard financiero con información de ingresos por facturas
   */
  async getDashboard2(
    filtros: FiltrosFinancierosDto,
  ): Promise<DashboardFinancieroDto> {
    const startTime = Date.now();
    const { fechaInicio, fechaFin, agruparPor = 'mes' } = filtros;

    try {
      // Construir fechas de filtro con validación
      let fechaInicioDate: Date | null = null;
      let fechaFinDate: Date | null = null;

      if (fechaInicio) {
        const tmp = new Date(fechaInicio);
        if (isNaN(tmp.getTime())) {
          throw new Error(`fechaInicio inválida: ${fechaInicio}`);
        }
        fechaInicioDate = new Date(
          Date.UTC(
            tmp.getUTCFullYear(),
            tmp.getUTCMonth(),
            tmp.getUTCDate(),
            0,
            0,
            0,
          ),
        );
      }

      if (fechaFin) {
        const tmp = new Date(fechaFin);
        if (isNaN(tmp.getTime())) {
          throw new Error(`fechaFin inválida: ${fechaFin}`);
        }
        fechaFinDate = new Date(
          Date.UTC(
            tmp.getUTCFullYear(),
            tmp.getUTCMonth(),
            tmp.getUTCDate(),
            23,
            59,
            59,
          ),
        );
      }

      // Construir cláusulas WHERE para las fechas
      const whereFechaInicio = fechaInicioDate
        ? Prisma.sql`AND f.fecha_factura >= ${fechaInicioDate}`
        : Prisma.empty;
      const whereFechaFin = fechaFinDate
        ? Prisma.sql`AND f.fecha_factura <= ${fechaFinDate}`
        : Prisma.empty;

      // Determinar la función de agrupamiento según el período
      let dateFunction: ReturnType<typeof Prisma.sql>;
      switch (agruparPor) {
        case 'día':
          dateFunction = Prisma.sql`DATE_TRUNC('day', f.fecha_factura)`;
          break;
        case 'semana':
          dateFunction = Prisma.sql`DATE_TRUNC('week', f.fecha_factura)`;
          break;
        case 'año':
          dateFunction = Prisma.sql`DATE_TRUNC('year', f.fecha_factura)`;
          break;
        default: // mes
          dateFunction = Prisma.sql`DATE_TRUNC('month', f.fecha_factura)`;
          break;
      }

      // Consulta principal para obtener información financiera por período
      const datosFinancieros = await this.prisma.$queryRaw<
        Array<{
          periodo: string;
          total_ingresos: number;
          total_facturas: bigint;
          promedio_ingresos_por_factura: number;
          factura_maxima: number;
          factura_minima: number;
        }>
      >`
        SELECT 
          ${dateFunction}::text AS periodo,
          SUM(f.total)::numeric(12,2) AS total_ingresos,
          COUNT(*)::bigint AS total_facturas,
          AVG(f.total)::numeric(12,2) AS promedio_ingresos_por_factura,
          MAX(f.total)::numeric(12,2) AS factura_maxima,
          MIN(f.total)::numeric(12,2) AS factura_minima
        FROM "Factura" f
        WHERE f.deleted = false
          ${whereFechaInicio}
          ${whereFechaFin}
        GROUP BY ${dateFunction}
        ORDER BY periodo ASC
      `;

      // Procesar datos por período
      const informacionPorPeriodo: InformacionFinancieraPorPeriodoDto[] =
        datosFinancieros.map((item) => ({
          periodo: item.periodo,
          totalIngresos: Number(item.total_ingresos || 0),
          totalFacturas: Number(item.total_facturas),
          promedioIngresosPorFactura: Number(
            item.promedio_ingresos_por_factura || 0,
          ),
          facturaMaxima: Number(item.factura_maxima || 0),
          facturaMinima: Number(item.factura_minima || 0),
        }));

      // Calcular estadísticas globales del rango
      const totalIngresosRango = informacionPorPeriodo.reduce(
        (sum, item) => sum + item.totalIngresos,
        0,
      );

      const totalFacturasRango = informacionPorPeriodo.reduce(
        (sum, item) => sum + item.totalFacturas,
        0,
      );

      const promedioIngresosPorPeriodo =
        informacionPorPeriodo.length > 0
          ? totalIngresosRango / informacionPorPeriodo.length
          : 0;

      const promedioGeneralPorFactura =
        totalFacturasRango > 0 ? totalIngresosRango / totalFacturasRango : 0;

      const facturaMaximaRango = Math.max(
        ...informacionPorPeriodo.map((item) => item.facturaMaxima),
        0,
      );

      const facturaMinimaRango = Math.min(
        ...informacionPorPeriodo.map((item) => item.facturaMinima),
        Number.MAX_SAFE_INTEGER,
      );

      // Encontrar períodos con mayor y menor ingreso
      const periodoMayorIngreso =
        informacionPorPeriodo.length > 0
          ? informacionPorPeriodo.reduce((max, item) =>
              item.totalIngresos > max.totalIngresos ? item : max,
            ).periodo
          : '';

      const periodoMenorIngreso =
        informacionPorPeriodo.length > 0
          ? informacionPorPeriodo.reduce((min, item) =>
              item.totalIngresos < min.totalIngresos ? item : min,
            ).periodo
          : '';

      const resultado: DashboardFinancieroDto = {
        informacionPorPeriodo,
        totalIngresosRango: Number(totalIngresosRango.toFixed(2)),
        promedioIngresosPorPeriodo: Number(
          promedioIngresosPorPeriodo.toFixed(2),
        ),
        totalFacturasRango,
        promedioGeneralPorFactura: Number(promedioGeneralPorFactura.toFixed(2)),
        facturaMaximaRango: Number(facturaMaximaRango.toFixed(2)),
        facturaMinimaRango:
          facturaMinimaRango === Number.MAX_SAFE_INTEGER
            ? 0
            : Number(facturaMinimaRango.toFixed(2)),
        periodoMayorIngreso,
        periodoMenorIngreso,
      };

      // Guardar log de la analítica
      const duracionMs = Date.now() - startTime;
      await this.saveAnalyticsLog(
        'dashboard-financiero',
        filtros,
        resultado,
        duracionMs,
      );

      this.logger.log(
        `Dashboard financiero generado exitosamente en ${duracionMs}ms`,
      );

      return resultado;
    } catch (error) {
      const duracionMs = Date.now() - startTime;
      this.logger.error(
        `Error en dashboard financiero (${duracionMs}ms): ${error.message}`,
      );
      throw error;
    }
  }
}
