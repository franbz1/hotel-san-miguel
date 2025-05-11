import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';
import {
  HabitacionesCambio,
  HabitacionSseService,
} from 'src/sse/habitacionSse.service';
import { EstadoHabitacion } from 'src/common/enums/estadosHbaitacion.enum';
import { EstadosReserva } from '@prisma/client';

@Injectable()
export class HabitacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly habitacionSseService: HabitacionSseService,
  ) {}

  /**
   * Crea una nueva habitación.
   * @param createHabitacionDto Datos de la habitación a crear.
   * @returns La habitación creada.
   */
  async create(createHabitacionDto: CreateHabitacionDto) {
    try {
      return await this.prisma.habitacion.create({
        data: createHabitacionDto,
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new BadRequestException(
          'Ya existe una habitación con ese número',
        );
      throw error;
    }
  }

  /**
   * Obtiene todos las habitaciones con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de habitaciones y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalHabitaciones = await this.prisma.habitacion.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalHabitaciones / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalHabitaciones,
      lastPage,
    );

    if (totalHabitaciones === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const habitaciones = await this.prisma.habitacion.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
    });

    return {
      data: habitaciones,
      meta: { page, limit, totalHabitaciones, lastPage },
    };
  }

  /**
   * Busca una habitación por su ID.
   * @param id ID de la habitación.
   * @returns La habitación encontrada.
   * @throws NotFoundException si la habitación no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.habitacion.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Busca una habitación por su numero de habitación.
   * @param numeroHabitacion Numero de la habitación.
   * @returns La habitación encontrada.
   * @throws NotFoundException si la habitación no existe.
   */
  async findByNumeroHabitacion(numeroHabitacion: number) {
    try {
      return await this.prisma.habitacion.findFirstOrThrow({
        where: { numero_habitacion: numeroHabitacion, deleted: false },
        include: {
          reservas: {
            where: {
              deleted: false,
              huesped: { deleted: false },
            },
            include: {
              huesped: true,
              huespedes_secundarios: {
                where: { deleted: false },
              },
              factura: {
                where: { deleted: false },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException(
          `No se encontró la habitación con el numero de habitación: ${numeroHabitacion}`,
        );
      throw error;
    }
  }

  /**
   * Actualiza los datos de una habitación por su ID.
   * @param id ID de la habitación.
   * @param updateHabitacionDto Datos para actualizar.
   * @returns La habitación actualizada.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si la habitación no existe.
   */
  async update(id: number, updateHabitacionDto: UpdateHabitacionDto) {
    if (!Object.keys(updateHabitacionDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar la habitación.',
      );
    }

    try {
      return await this.prisma.habitacion.update({
        where: { id, deleted: false },
        data: updateHabitacionDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina una habitación por su ID.
   * @param id ID de la habitación.
   * @returns La habitación eliminada.
   * @throws NotFoundException si la habitación no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.habitacion.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Obtiene las habitaciones disponibles entre dos fechas.
   * @param fechaInicio Fecha de inicio.
   * @param fechaFin Fecha de fin.
   * @returns Las habitaciones disponibles.
   */
  async getHabitacionesDisponiblesEntreFechas(
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    try {
      // Obtener todas las habitaciones que no estén eliminadas y que no tengan reservas
      // que se superpongan con el rango de fechas solicitado
      const habitacionesDisponibles = await this.prisma.habitacion.findMany({
        where: {
          deleted: false,
          // Usamos 'none' para excluir las habitaciones con reservas que se superponen al periodo solicitado
          reservas: {
            none: {
              deleted: false,
              // Una reserva se superpone si:
              // - Su fecha de inicio es anterior o igual a la fecha de fin solicitada Y
              // - Su fecha de fin es posterior o igual a la fecha de inicio solicitada
              AND: [
                { fecha_inicio: { lte: fechaFin } },
                { fecha_fin: { gte: fechaInicio } },
              ],
            },
          },
        },
        // Incluimos información relevante para mostrar al usuario
        select: {
          id: true,
          numero_habitacion: true,
          tipo: true,
          estado: true,
          precio_por_noche: true,
          createdAt: true,
          updatedAt: true,
        },
        // Ordenamos por número de habitación para facilitar la visualización
        orderBy: {
          numero_habitacion: 'asc',
        },
      });

      return habitacionesDisponibles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cron job que se ejecuta cada minuto para actualizar automáticamente los estados
   * de las habitaciones según las reservas actuales.
   *
   * Este método realiza las siguientes operaciones:
   * 1. Identifica habitaciones que deben marcarse como RESERVADAS (próximas 6 horas)
   * 2. Identifica habitaciones que deben marcarse como OCUPADAS (reserva en curso)
   * 3. Identifica habitaciones que deben marcarse como LIBRES (sin reservas activas)
   * 4. Actualiza todos los estados en una única transacción para garantizar consistencia
   * 5. Emite los cambios a través del servicio SSE para actualizar interfaces en tiempo real
   *
   * @returns Objeto con el conteo de habitaciones actualizadas por cada estado
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async marcarEstadosCronConTransaccion() {
    const ahora = new Date();
    const limiteFuturo = new Date(ahora.getTime() + 6 * 60 * 60 * 1000);

    // Defino los filtros en variables para reutilizarlos
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

    // Ejecuto todo en un callback para asegurarme de usar el mismo snapshot
    const [nearRooms, occRooms, freeRooms] = await this.prisma.$transaction(
      async (tx) => {
        // 1) Busco los IDs de las habitaciones a actualizar
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

        // 2) Aplico las actualizaciones en la misma transacción
        await Promise.all([
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
        ]);

        // 3) Devuelvo los arrays de IDs para construir el payload SSE
        return [nearRooms, occRooms, freeRooms];
      },
    );

    // 4. Construyo el payload para enviar por SSE
    const cambios: HabitacionesCambio[] = [
      ...nearRooms.map((r) => ({
        habitacionId: r.id,
        nuevoEstado: EstadoHabitacion.RESERVADO,
      })),
      ...occRooms.map((r) => ({
        habitacionId: r.id,
        nuevoEstado: EstadoHabitacion.OCUPADO,
      })),
      ...freeRooms.map((r) => ({
        habitacionId: r.id,
        nuevoEstado: EstadoHabitacion.LIBRE,
      })),
    ];

    // 5. Emisión por SSE para actualizar los clientes en tiempo real
    this.habitacionSseService.emitirCambios(cambios);

    return {
      near: nearRooms.length,
      occupied: occRooms.length,
      free: freeRooms.length,
    };
  }
}
