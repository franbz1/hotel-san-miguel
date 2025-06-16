import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfiguracionAseo, Habitacion } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ConfiguracionAseoService } from 'src/configuracion-aseo/configuracion-aseo.service';
import { ReportesAseoService } from 'src/reportes-aseo/reportes-aseo.service';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AseoCronService implements OnModuleInit {
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly logFile = path.join(this.logDir, 'aseo-cron.log');

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportesAseoService: ReportesAseoService,
    private readonly configuracionAseoService: ConfiguracionAseoService,
    private readonly notificacionesService: NotificacionesService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Inicializa el módulo y configura el cron job con la hora de la configuración
   */
  async onModuleInit() {
    await this.configurarCronJob();
  }

  /**
   * Configura el cron job con la hora especificada en la configuración
   */
  private async configurarCronJob() {
    try {
      const configuracion = await this.obtenerConfiguracionAseo();

      // Crear expresión cron basada en la configuración
      // Usar hora_proceso_nocturno_utc como base (formato HH:MM)
      const horaConfig = configuracion.hora_proceso_nocturno_utc || '00:00';
      const [hora, minuto] = horaConfig.split(':').map(Number);
      const cronExpression = `${minuto} ${hora} * * *`;

      this.log('Configurando cron job para aseo diario', {
        horaConfig,
        hora,
        minuto,
        expresion: cronExpression,
      });

      // Eliminar cron job existente si existe
      try {
        this.schedulerRegistry.deleteCronJob('aseo-diario');
      } catch {
        // No existe, continuar
      }

      // Crear nuevo cron job
      const job = new CronJob(cronExpression, () => {
        this.ejecutarProcesoAseoDiario();
      });

      // Registrar el cron job
      this.schedulerRegistry.addCronJob('aseo-diario', job);
      job.start();

      this.log('Cron job de aseo diario configurado exitosamente');
    } catch (error) {
      this.log(
        'Error al configurar cron job de aseo diario',
        { error: error.message },
        'error',
      );
    }
  }

  /**
   * Sistema de logging personalizado que escribe únicamente en archivo
   * @param mensaje Mensaje principal del log
   * @param datos Datos adicionales opcionales
   * @param nivel Nivel del log (info, error, warn)
   */
  private log(
    mensaje: string,
    datos?: any,
    nivel: 'info' | 'error' | 'warn' = 'info',
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      nivel,
      mensaje,
      ...(datos && { datos }),
    };

    // Solo escribir en archivo
    this.escribirLogEnArchivo(logEntry);
  }

  /**
   * Escribe el log en archivo
   * @param logEntry Entrada del log a escribir
   */
  private escribirLogEnArchivo(logEntry: any) {
    try {
      // Crear directorio de logs si no existe
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      // Escribir log en archivo
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      // Si falla el log en archivo, mostrar error crítico en consola
      console.error(
        `Error crítico al escribir log en archivo: ${error.message}`,
      );
    }
  }

  /**
   * Genera el reporte de aseo diario automatizado
   * Ejecuta todas las tareas de mantenimiento de aseo:
   * - Genera reporte nocturno
   * - Actualiza estados de aseo de habitaciones y zonas comunes
   * - Evalúa rotación de colchones y desinfección
   * - Envía notificaciones si están habilitadas
   */
  private async ejecutarProcesoAseoDiario() {
    try {
      this.log('Iniciando proceso de aseo diario automatizado');

      // Obtener configuración actual
      const configuracion = await this.obtenerConfiguracionAseo();

      // Obtener fecha actual para el reporte
      const fechaHoy = new Date().toISOString().split('T')[0];

      // 1. Generar reporte de aseo nocturno
      this.log('Generando reporte de aseo nocturno', { fecha: fechaHoy });
      await this.generarReporteAseoNocturno(fechaHoy);

      // 2. Actualizar estados de aseo de zonas comunes
      this.log('Actualizando estados de aseo de zonas comunes');
      await this.actualizarEstadosAseoZonasComunes(fechaHoy);

      // 3. Actualizar estados de aseo de habitaciones y evaluar rotación/desinfección
      this.log('Actualizando estados de aseo de habitaciones');
      const {
        success,
        idsHabitacionesQueNecesitanRotacion,
        idsHabitacionesQueDebenNotificarRotacion,
        idsHabitacionesQueNecesitanDesinfeccion,
      } = await this.actualizarEstadosAseoHabitaciones(configuracion);

      if (success) {
        this.log('Resultados de evaluación de habitaciones', {
          rotacionNecesaria: idsHabitacionesQueNecesitanRotacion.length,
          desinfeccionNecesaria: idsHabitacionesQueNecesitanDesinfeccion.length,
          notificacionRotacion: idsHabitacionesQueDebenNotificarRotacion.length,
          idsRotacion: idsHabitacionesQueNecesitanRotacion,
          idsDesinfeccion: idsHabitacionesQueNecesitanDesinfeccion,
          idsNotificacion: idsHabitacionesQueDebenNotificarRotacion,
        });

        // 4. Enviar notificaciones si están habilitadas
        if (configuracion.habilitar_notificaciones) {
          if (idsHabitacionesQueDebenNotificarRotacion.length > 0) {
            this.log('Enviando notificaciones de rotación de colchones', {
              cantidad: idsHabitacionesQueDebenNotificarRotacion.length,
              habitaciones: idsHabitacionesQueDebenNotificarRotacion,
            });
            await this.notificarRotacionColchones(
              idsHabitacionesQueDebenNotificarRotacion,
            );
          }

          // 5. Evaluar y notificar desinfección de zonas comunes
          this.log('Evaluando desinfección de zonas comunes');
          const idsZonasComunesQueDebenNotificarDesinfeccion =
            await this.evaluarDesinfeccionZonasComunes();

          if (idsZonasComunesQueDebenNotificarDesinfeccion.length > 0) {
            this.log(
              'Zonas comunes que requieren notificación de desinfección',
              {
                cantidad: idsZonasComunesQueDebenNotificarDesinfeccion.length,
                zonas: idsZonasComunesQueDebenNotificarDesinfeccion,
              },
            );
          }
        } else {
          this.log('Notificaciones deshabilitadas en configuración');
        }

        this.log('Proceso de aseo diario completado exitosamente');
      } else {
        this.log(
          'Error en la actualización de estados de aseo de habitaciones',
          {},
          'error',
        );
      }
    } catch (error) {
      this.log(
        'Error en el proceso de aseo diario automatizado',
        { error: error.message, stack: error.stack },
        'error',
      );
    }
  }

  /**
   * Genera un reporte de aseo nocturno para la fecha especificada
   * @param fecha Fecha en formato string para generar el reporte
   * @returns Promise con el reporte generado o undefined en caso de error
   */
  async generarReporteAseoNocturno(fecha: string) {
    if (!fecha) {
      throw new BadRequestException('La fecha es requerida');
    }

    try {
      return await this.reportesAseoService.generarReporte(fecha);
    } catch (error) {
      console.error('Error al generar el reporte de aseo nocturno:', error);
    }
  }

  /**
   * Actualiza los estados de aseo de todas las zonas comunes para requerir aseo hoy
   * @param fecha Fecha en formato string para el proceso (requerida pero no utilizada actualmente)
   * @returns Promise<boolean> - true si la actualización fue exitosa, false en caso de error
   */
  async actualizarEstadosAseoZonasComunes(fecha: string): Promise<boolean> {
    if (!fecha) {
      throw new BadRequestException('La fecha es requerida');
    }

    try {
      await this.prisma.zonaComun.updateMany({
        where: {
          deleted: false,
        },
        data: {
          requerido_aseo_hoy: true,
        },
      });
      return true;
    } catch (error) {
      console.error(
        'Error al actualizar los estados de aseo de las zonas comunes:',
        error,
      );
      return false;
    }
  }

  /**
   * Actualiza los estados de aseo de todas las habitaciones y evalúa cuáles necesitan rotación de colchones y desinfección.
   * Utiliza una transacción para garantizar la consistencia de los datos.
   * Solo evalúa notificaciones si están habilitadas en la configuración.
   * @returns Promise con objeto que contiene:
   *   - success: boolean indicando si la operación fue exitosa
   *   - idsHabitacionesQueNecesitanRotacion: array de IDs de habitaciones que necesitan rotación
   *   - idsHabitacionesQueDebenNotificarRotacion: array de IDs de habitaciones que requieren notificación
   *   - idsHabitacionesQueNecesitanDesinfeccion: array de IDs de habitaciones que necesitan desinfección
   */
  async actualizarEstadosAseoHabitaciones(
    configuracion: ConfiguracionAseo,
  ): Promise<{
    success: boolean;
    idsHabitacionesQueNecesitanRotacion: number[];
    idsHabitacionesQueDebenNotificarRotacion: number[];
    idsHabitacionesQueNecesitanDesinfeccion: number[];
  }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Obtener todas las habitaciones activas para rotación
        const habitacionesRotacion = await tx.habitacion.findMany({
          where: {
            deleted: false,
          },
          select: {
            id: true,
            proxima_rotacion_colchones: true,
            requerido_rotacion_colchones: true,
          },
        });

        // Obtener todas las habitaciones activas completas para desinfección
        const habitacionesCompletas = await tx.habitacion.findMany({
          where: {
            deleted: false,
          },
        });

        // Evaluar cuáles habitaciones necesitan rotación de colchones
        const evaluacionRotacion = await this.evaluarRotacionColchones(
          habitacionesRotacion,
          configuracion.habilitar_notificaciones,
        );

        // Evaluar cuáles habitaciones necesitan desinfección (ocupadas hoy)
        const idsHabitacionesQueNecesitanDesinfeccion =
          await this.evaluarDesinfeccionHabitaciones(habitacionesCompletas);

        // Actualizar todas las habitaciones para requerir aseo hoy
        await tx.habitacion.updateMany({
          where: {
            deleted: false,
          },
          data: {
            requerido_aseo_hoy: true,
          },
        });

        // Actualizar habitaciones que necesitan rotación de colchones
        if (evaluacionRotacion.idsHabitacionesQueNecesitanRotacion.length > 0) {
          await tx.habitacion.updateMany({
            where: {
              id: {
                in: evaluacionRotacion.idsHabitacionesQueNecesitanRotacion,
              },
              deleted: false,
            },
            data: {
              requerido_rotacion_colchones: true,
            },
          });
        }

        // Actualizar habitaciones que necesitan desinfección
        if (idsHabitacionesQueNecesitanDesinfeccion.length > 0) {
          await tx.habitacion.updateMany({
            where: {
              id: {
                in: idsHabitacionesQueNecesitanDesinfeccion,
              },
              deleted: false,
            },
            data: {
              requerido_desinfeccion_hoy: true,
            },
          });
        }

        return {
          success: true,
          idsHabitacionesQueNecesitanRotacion:
            evaluacionRotacion.idsHabitacionesQueNecesitanRotacion,
          idsHabitacionesQueDebenNotificarRotacion:
            evaluacionRotacion.idsHabitacionesQueDebenNotificarRotacion,
          idsHabitacionesQueNecesitanDesinfeccion,
        };
      });
    } catch (error) {
      console.error(
        'Error al actualizar los estados de aseo de las habitaciones:',
        error,
      );
      return {
        success: false,
        idsHabitacionesQueNecesitanRotacion: [],
        idsHabitacionesQueDebenNotificarRotacion: [],
        idsHabitacionesQueNecesitanDesinfeccion: [],
      };
    }
  }

  /**
   * Determina si se debe notificar sobre la próxima rotación de colchones
   * basado en los días de aviso configurados
   * @param fecha Fecha de próxima rotación en formato string (YYYY-MM-DD)
   * @returns Promise<boolean> - true si está dentro del rango de días de aviso
   */
  private async seDebeNotificarRotacionColchones(
    fecha: string,
  ): Promise<boolean> {
    // Crear fecha de hoy en UTC
    const fechaHoy = new Date();
    fechaHoy.setUTCHours(0, 0, 0, 0);

    // Crear fecha de próxima rotación en UTC
    const fechaProximaRotacion = new Date(fecha + 'T00:00:00.000Z');

    const { dias_aviso_rotacion_colchones } =
      await this.obtenerConfiguracionAseo();

    const dias =
      (fechaProximaRotacion.getTime() - fechaHoy.getTime()) /
      (1000 * 60 * 60 * 24);

    return dias <= dias_aviso_rotacion_colchones;
  }

  /**
   * Determina si una habitación necesita rotación de colchones
   * basado en si la fecha de rotación llegó o ya pasó
   * @param fecha Fecha de próxima rotación en formato string (YYYY-MM-DD)
   * @returns Promise<boolean> - true si necesita rotación (fecha llegó o pasó)
   */
  private async necesitaRotacionColchones(fecha: string): Promise<boolean> {
    // Crear fecha de hoy en UTC
    const fechaHoy = new Date();
    fechaHoy.setUTCHours(0, 0, 0, 0);

    // Crear fecha de próxima rotación en UTC
    const fechaProximaRotacion = new Date(fecha + 'T00:00:00.000Z');

    const dias =
      (fechaProximaRotacion.getTime() - fechaHoy.getTime()) /
      (1000 * 60 * 60 * 24);

    // Necesita rotación si la fecha llegó o ya pasó (días <= 0)
    return dias <= 0;
  }

  /**
   * Evalúa qué habitaciones necesitan rotación de colchones y cuáles requieren notificación.
   * Solo evalúa notificaciones si están habilitadas en la configuración.
   * @param habitaciones Array de habitaciones con datos de rotación de colchones
   * @param notificacionesHabilitadas Boolean que indica si las notificaciones están activas
   * @returns Promise con objeto que contiene los IDs de habitaciones que necesitan rotación y notificación
   */
  private async evaluarRotacionColchones(
    habitaciones: {
      id: number;
      proxima_rotacion_colchones: Date | null;
      requerido_rotacion_colchones: boolean;
    }[],
    notificacionesHabilitadas: boolean,
  ): Promise<EvaluacionRotacionColchones> {
    const evaluacion: EvaluacionRotacionColchones = {
      idsHabitacionesQueNecesitanRotacion: [],
      idsHabitacionesQueDebenNotificarRotacion: [],
    };

    for (const habitacion of habitaciones) {
      // Si no tiene fecha de próxima rotación, saltar
      if (!habitacion.proxima_rotacion_colchones) {
        continue;
      }

      const fechaProximaRotacion = habitacion.proxima_rotacion_colchones
        .toISOString()
        .split('T')[0];

      // Verificar si necesita rotación (fecha llegó o pasó)
      if (await this.necesitaRotacionColchones(fechaProximaRotacion)) {
        evaluacion.idsHabitacionesQueNecesitanRotacion.push(habitacion.id);
      }
      // Solo evaluar notificaciones si están habilitadas en la configuración
      else if (
        notificacionesHabilitadas &&
        (await this.seDebeNotificarRotacionColchones(fechaProximaRotacion))
      ) {
        evaluacion.idsHabitacionesQueDebenNotificarRotacion.push(habitacion.id);
      }
    }

    return evaluacion;
  }

  /**
   * Evalúa qué habitaciones necesitan desinfección si van a ser ocupadas el día de hoy
   * (hoy está entre la fecha de inicio y fin de la reserva)
   * @param habitaciones Array de habitaciones con datos de desinfección
   * @returns Promise con array de IDs de habitaciones que necesitan desinfección
   */
  private async evaluarDesinfeccionHabitaciones(
    habitaciones: Habitacion[],
  ): Promise<number[]> {
    const fechaHoy = new Date();
    fechaHoy.setUTCHours(0, 0, 0, 0); // Normalizar a inicio del día en UTC

    const idsHabitacionesQueNecesitanDesinfeccion: number[] = [];

    for (const habitacion of habitaciones) {
      // Verificar si la habitación tiene reservas activas para hoy
      const tieneReservaHoy = await this.habitacionTieneReservaHoy(
        habitacion.id,
        fechaHoy,
      );

      if (tieneReservaHoy) {
        idsHabitacionesQueNecesitanDesinfeccion.push(habitacion.id);
      }
    }

    return idsHabitacionesQueNecesitanDesinfeccion;
  }

  /**
   * Verifica si una habitación tiene reservas activas para el día de hoy
   * @param habitacionId ID de la habitación a verificar
   * @param fechaHoy Fecha de hoy normalizada en UTC
   * @returns Promise<boolean> - true si tiene reserva activa hoy
   */
  private async habitacionTieneReservaHoy(
    habitacionId: number,
    fechaHoy: Date,
  ): Promise<boolean> {
    const fechaFinDia = new Date(fechaHoy);
    fechaFinDia.setUTCHours(23, 59, 59, 999); // Final del día en UTC

    // Buscar reservas que estén activas hoy
    // (fecha_inicio <= hoy <= fecha_fin)
    const reservaActiva = await this.prisma.reserva.findFirst({
      where: {
        habitacionId: habitacionId,
        fecha_inicio: {
          lte: fechaFinDia, // La reserva comenzó antes o hoy
        },
        fecha_fin: {
          gte: fechaHoy, // La reserva termina hoy o después
        },
        deleted: false,
      },
    });

    return reservaActiva !== null;
  }

  /**
   * Evalúa qué zonas comunes necesitan notificación de desinfección
   * basado en los días de aviso configurados
   * @returns Promise con array de IDs de zonas comunes que requieren notificación
   */
  private async evaluarDesinfeccionZonasComunes(): Promise<number[]> {
    const fechaHoy = new Date();
    fechaHoy.setUTCHours(0, 0, 0, 0);

    const configuracion = await this.obtenerConfiguracionAseo();
    const idsZonasComunesQueDebenNotificar: number[] = [];

    // Obtener todas las zonas comunes activas
    const zonasComunes = await this.prisma.zonaComun.findMany({
      where: {
        deleted: false,
      },
      select: {
        id: true,
        proxima_desinfeccion_zona_comun: true,
      },
    });

    for (const zona of zonasComunes) {
      if (!zona.proxima_desinfeccion_zona_comun) {
        continue;
      }

      const fechaProximaDesinfeccion = new Date(
        zona.proxima_desinfeccion_zona_comun.toISOString().split('T')[0] +
          'T00:00:00.000Z',
      );

      const dias =
        (fechaProximaDesinfeccion.getTime() - fechaHoy.getTime()) /
        (1000 * 60 * 60 * 24);

      // Verificar si está dentro del rango de días de aviso
      if (dias <= configuracion.dias_aviso_desinfeccion_zona_comun) {
        idsZonasComunesQueDebenNotificar.push(zona.id);
      }
    }

    return idsZonasComunesQueDebenNotificar;
  }

  /**
   * Notifica a los usuarios sobre la próxima rotación de colchones
   * @param idsHabitaciones Array de IDs de habitaciones que requieren notificación
   * @returns Promise<void>
   */
  private async notificarRotacionColchones(
    idsHabitaciones: number[],
  ): Promise<void> {
    await this.notificacionesService.notificarRotacionColchones(
      idsHabitaciones,
    );
  }

  /**
   * Reconfigura el cron job cuando cambia la configuración
   * Método público para ser llamado desde el servicio de configuración
   */
  async reconfigurarCronJob() {
    await this.configurarCronJob();
  }

  /**
   * Obtiene la configuración de aseo actual del sistema
   * @returns Promise<ConfiguracionAseo> - La configuración de aseo activa
   */
  private async obtenerConfiguracionAseo(): Promise<ConfiguracionAseo> {
    const configuracion =
      await this.configuracionAseoService.obtenerConfiguracion();
    return configuracion;
  }
}

/**
 * Interfaz que define el resultado de la evaluación de rotación de colchones
 */
interface EvaluacionRotacionColchones {
  /** Array de IDs de habitaciones que necesitan rotación de colchones (fecha llegó o pasó) */
  idsHabitacionesQueNecesitanRotacion: number[];
  /** Array de IDs de habitaciones que requieren notificación (dentro del rango de días de aviso) */
  idsHabitacionesQueDebenNotificarRotacion: number[];
}
