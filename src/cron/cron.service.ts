import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { EstadoHabitacion } from 'src/common/enums/estadosHbaitacion.enum';
import { EstadosReserva } from '@prisma/client';
import {
  HabitacionesCambio,
  HabitacionSseService,
} from 'src/sse/habitacionSse.service';
import { ReservaCambio, ReservaSseService } from 'src/sse/reservasSse.service';

@Injectable()
export class CronService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly habitacionSseService: HabitacionSseService,
    private readonly reservaSseService: ReservaSseService,
  ) {}

  /**
   * Cron job que se ejecuta cada minuto para actualizar automáticamente los estados
   * de las habitaciones y reservas según las condiciones actuales.
   *
   * Este método realiza las siguientes operaciones:
   * 1. Identifica habitaciones que deben marcarse como RESERVADAS (próximas 6 horas)
   * 2. Identifica habitaciones que deben marcarse como OCUPADAS (reserva en curso)
   * 3. Identifica habitaciones que deben marcarse como LIBRES (sin reservas activas)
   * 4. Identifica reservas que han finalizado (fecha_fin < ahora) para marcarlas como FINALIZADAS
   * 5. Actualiza todos los estados en una única transacción para garantizar consistencia
   * 6. Emite los cambios a través de servicios SSE para actualizar interfaces en tiempo real
   *
   * @returns Objeto con el conteo de habitaciones y reservas actualizadas por estado
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async marcarEstadosCronConTransaccion() {
    const ahora = new Date();
    const limiteFuturo = new Date(ahora.getTime() + 6 * 60 * 60 * 1000);

    // --- Definición de filtros para habitaciones ---
    // Habitaciones que deben marcarse como RESERVADAS (con reservas en las próximas 6 horas)
    const nearWhere = {
      deleted: false,
      estado: { notIn: [EstadoHabitacion.RESERVADO, EstadoHabitacion.OCUPADO] },
      reservas: {
        some: {
          deleted: false,
          estado: { in: [EstadosReserva.RESERVADO] },
          fecha_inicio: { gte: ahora, lte: limiteFuturo },
        },
      },
    };

    // Habitaciones que deben marcarse como OCUPADAS (con reservas activas en este momento)
    const occWhere = {
      deleted: false,
      estado: { notIn: [EstadoHabitacion.OCUPADO] },
      reservas: {
        some: {
          deleted: false,
          estado: { in: [EstadosReserva.RESERVADO] },
          fecha_inicio: { lte: ahora },
          fecha_fin: { gt: ahora },
        },
      },
    };

    // Habitaciones que deben marcarse como LIBRES (sin reservas activas o próximas)
    const freeWhere = {
      deleted: false,
      reservas: {
        none: {
          deleted: false,
          estado: { in: [EstadosReserva.RESERVADO, EstadosReserva.PENDIENTE] },
          OR: [
            { fecha_inicio: { gte: ahora, lte: limiteFuturo } },
            {
              AND: [
                { fecha_inicio: { lte: ahora } },
                { fecha_fin: { gt: ahora } },
              ],
            },
          ],
        },
      },
      estado: { not: EstadoHabitacion.LIBRE },
    };

    // --- Definición de filtros para reservas ---
    // Reservas que deben marcarse como FINALIZADAS (la fecha de fin ya pasó)
    const reservasFinalizadasWhere = {
      deleted: false,
      estado: EstadosReserva.RESERVADO,
      fecha_fin: { lt: ahora },
    };

    // Ejecuto todo en una transacción para garantizar consistencia
    const result = await this.prisma.$transaction(async (tx) => {
      // 1) Habitaciones: Busco los IDs de las habitaciones a actualizar
      const nearRooms = await tx.habitacion.findMany({
        where: nearWhere,
        select: { id: true },
      });
      const occRooms = await tx.habitacion.findMany({
        where: occWhere,
        select: { id: true },
      });
      const freeRooms = await tx.habitacion.findMany({
        where: freeWhere,
        select: { id: true },
      });

      // 2) Reservas: Busco las reservas finalizadas para marcarlas como FINALIZADAS
      const reservasFinalizadas = await tx.reserva.findMany({
        where: reservasFinalizadasWhere,
        select: {
          id: true,
          habitacionId: true,
        },
      });

      // 3) Ejecuto todas las actualizaciones en la misma transacción
      await Promise.all([
        // Actualizaciones de habitaciones
        tx.habitacion.updateMany({
          where: nearWhere,
          data: { estado: EstadoHabitacion.RESERVADO },
        }),
        tx.habitacion.updateMany({
          where: occWhere,
          data: { estado: EstadoHabitacion.OCUPADO },
        }),
        tx.habitacion.updateMany({
          where: freeWhere,
          data: { estado: EstadoHabitacion.LIBRE },
        }),
        // Actualización de reservas finalizadas
        tx.reserva.updateMany({
          where: reservasFinalizadasWhere,
          data: { estado: EstadosReserva.FINALIZADO },
        }),
      ]);

      // 4) Devuelvo los datos necesarios para construir los payloads SSE
      return {
        nearRooms,
        occRooms,
        freeRooms,
        reservasFinalizadas,
      };
    });

    // 5. Construyo y emito el payload para SSE de habitaciones
    const cambiosHabitaciones: HabitacionesCambio[] = [
      ...result.nearRooms.map((r) => ({
        habitacionId: r.id,
        nuevoEstado: EstadoHabitacion.RESERVADO,
      })),
      ...result.occRooms.map((r) => ({
        habitacionId: r.id,
        nuevoEstado: EstadoHabitacion.OCUPADO,
      })),
      ...result.freeRooms.map((r) => ({
        habitacionId: r.id,
        nuevoEstado: EstadoHabitacion.LIBRE,
      })),
    ];
    this.habitacionSseService.emitirCambios(cambiosHabitaciones);

    // 6. Emito cambios de reservas por habitación individual
    // Agrupa reservas por habitación para optimizar las emisiones
    const cambiosPorHabitacion = new Map<number, ReservaCambio[]>();
    for (const reserva of result.reservasFinalizadas) {
      const cambio: ReservaCambio = {
        reservaId: reserva.id,
        nuevoEstado: EstadosReserva.FINALIZADO,
      };
      // Agrupa los cambios por habitacionId
      if (!cambiosPorHabitacion.has(reserva.habitacionId)) {
        cambiosPorHabitacion.set(reserva.habitacionId, []);
      }
      cambiosPorHabitacion.get(reserva.habitacionId).push(cambio);
    }
    // Emite los cambios para cada habitación
    for (const [habitacionId, cambios] of cambiosPorHabitacion.entries()) {
      for (const cambio of cambios) {
        this.reservaSseService.emitirCambio(habitacionId, cambio);
      }
    }

    // 7. Devuelve resumen de las actualizaciones
    return {
      habitaciones: {
        near: result.nearRooms.length,
        occupied: result.occRooms.length,
        free: result.freeRooms.length,
      },
      reservas: {
        finalizadas: result.reservasFinalizadas.length,
      },
    };
  }
}
