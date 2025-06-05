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
   * Calcula la ocupación del hotel por períodos (corregido, con comparación adecuada de enums)
   * @param filtros Filtros para la consulta de ocupación
   * @returns Análisis detallado de ocupación con cálculo de noches ocupadas, ADR real y tasa de ocupación adecuada
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

    // Obtener fragmento SQL para agrupar por día/semana/mes/año
    const dateFunction = this.getDateTruncFunction(agruparPor);

    // Consulta raw para obtener reservas, ingresos y noches ocupadas por período
    const ocupacionPorPeriodo = await this.prisma.$queryRaw<
      Array<{
        periodo: string;
        total_reservas: bigint;
        ingresos_totales: number;
        noches_ocupadas: bigint;
      }>
    >`
    SELECT
      ${dateFunction} AS periodo,
      COUNT(*)::bigint AS total_reservas,
      SUM(r.costo) AS ingresos_totales,
      COALESCE(
        SUM(
          (
            -- Calcula superposición en días entre la reserva y el rango
            GREATEST(
              LEAST(r."fecha_fin", ${fechaFinObj})::date,
              ${fechaInicioObj}::date
            )::date
            -
            GREATEST(
              r."fecha_inicio"::date,
              ${fechaInicioObj}::date
            )::date
          )
        )::bigint,
        0::bigint
      ) AS noches_ocupadas
    FROM "Reserva" r
    INNER JOIN "Habitacion" h
      ON r."habitacionId" = h.id
      AND h.deleted = false
    WHERE r.deleted = false
      AND r."fecha_inicio" <= ${fechaFinObj}
      AND r."fecha_fin" >= ${fechaInicioObj}
      ${
        tipoHabitacion
          ? Prisma.sql`AND h.tipo::text = ${tipoHabitacion}`
          : Prisma.empty
      }
    GROUP BY ${dateFunction}
    ORDER BY periodo DESC
  `;

    // Obtener el número total de habitaciones activas (deleted = false), opcionalmente por tipo
    const totalHabitaciones = await this.prisma.habitacion.count({
      where: {
        deleted: false,
        ...(tipoHabitacion && { tipo: tipoHabitacion }),
      },
    });

    // Auxiliar para saber cuántos días tiene cada período
    function obtenerDiasEnPeriodo(periodoStr: string): number {
      const fecha = new Date(periodoStr);
      switch (agruparPor) {
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

    // Procesar resultados asegurándose de convertir BigInt a Number antes de cualquier operación
    const datosOcupacion: OcupacionPorPeriodoDto[] = ocupacionPorPeriodo.map(
      (item) => {
        const totalReservas = Number(item.total_reservas);
        const ingresosTotales = Number(item.ingresos_totales) || 0;
        const nochesOcupadas = Number(item.noches_ocupadas) || 0;

        // ADR real = ingresos_totales / noches_ocupadas (si no hay noches, ADR = 0)
        const adr = nochesOcupadas > 0 ? ingresosTotales / nochesOcupadas : 0;

        // Días que comprende este período (1, 7, 28–31 o 365/366)
        const diasEnPeriodo = obtenerDiasEnPeriodo(item.periodo);

        // Tasa de ocupación = (nochesOcupadas) / (totalHabitaciones × díasEnPeriodo) × 100
        const tasaOcupacion =
          totalHabitaciones > 0
            ? (nochesOcupadas / (totalHabitaciones * diasEnPeriodo)) * 100
            : 0;

        // RevPAR real = ADR × (tasaOcupacion / 100)
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
    const startTime = Date.now();
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
      // (en el caso “sin filtros”, no habrá cláusulas WHERE adicionales y por tanto
      // se incluirán todos los que tengan alguna reserva).
      //
      // Además:
      //  - Eliminamos la doble atribución de ingresos a secundarios. Sólo atribuiremos
      //    el costo de cada reserva al huésped principal “huespedId”. A los secundarios
      //    los contaremos para efectos de demografía (cantidad) pero no les sumaremos
      //    el costo de la reserva completa (esto evita duplicación de ingresos).
      //  - Conservamos un UNION para combinar “principales” y “secundarios”, pero
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
      --    JOIN  LEFT  con los ingresos solo para “principales”
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

      // Si no hay ningún registro, devolvemos un arreglo vacío inmediatamente
      if (demografiaData.length === 0) {
        const duracionMs = Date.now() - startTime;
        await this.saveAnalyticsLog('demografia', filtros, [], duracionMs);
        return [];
      }

      // A esta altura, demografiaData tiene la forma:
      // [
      //   { nacionalidad: 'colombia', tipo_huesped: 'principal', cantidad: BigInt, ingresos: Number },
      //   { nacionalidad: 'colombia', tipo_huesped: 'secundario', cantidad: BigInt, ingresos: 0 },
      //   { nacionalidad: 'ecuador', tipo_huesped: 'principal', cantidad: BigInt, ingresos: Number },
      //   … etc.
      // ]
      //
      // Lo que queremos como salida final es, POR CADA nacionalidad (independientemente
      // de “principal” o “secundario”), sumar la cantidad total (principales + secundarios)
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

      // Guardamos log de la analítica
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
