import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';
import { TiposAseo } from '@prisma/client';
import { ConfiguracionAseoService } from 'src/configuracion-aseo/configuracion-aseo.service';
import { FiltrosAseoHabitacionDto } from './dto/filtros-aseo-habitacion.dto';

@Injectable()
export class HabitacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configuracionAseoService: ConfiguracionAseoService,
  ) {}

  /**
   * Crea una nueva habitación.
   * @param createHabitacionDto Datos de la habitación a crear.
   * @returns La habitación creada.
   */
  async create(createHabitacionDto: CreateHabitacionDto) {
    // Verificar si ya existe una habitación con el mismo número que no esté eliminada
    const habitacionExistente = await this.prisma.habitacion.findFirst({
      where: {
        numero_habitacion: createHabitacionDto.numero_habitacion,
        deleted: false,
      },
    });

    if (habitacionExistente) {
      throw new BadRequestException(
        'Ya existe una habitación activa con ese número',
      );
    }

    try {
      const { frecuencia_rotacion_colchones } =
        await this.configuracionAseoService.obtenerConfiguracion();

      return await this.prisma.habitacion.create({
        data: {
          ...createHabitacionDto,
          ultimo_aseo_fecha: new Date(),
          ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
          ultima_rotacion_colchones: new Date(),
          proxima_rotacion_colchones: new Date(
            new Date().getTime() +
              frecuencia_rotacion_colchones * 24 * 60 * 60 * 1000,
          ),
          requerido_aseo_hoy: false,
          requerido_desinfeccion_hoy: false,
          requerido_rotacion_colchones: false,
        },
      });
    } catch (error) {
      // Mantenemos el manejo de otros posibles errores de Prisma
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Error al crear la habitación. Verifique los datos proporcionados.',
        );
      }
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
   * Obtiene habitaciones con información específica para el módulo de aseo
   * @param paginationDto Datos de paginación
   * @param filtrosAseoDto Filtros específicos para aseo
   * @returns Objeto con la lista de habitaciones para aseo y metadatos de paginación
   */
  async findAllForAseo(
    paginationDto: PaginationDto,
    filtrosAseoDto: FiltrosAseoHabitacionDto,
  ) {
    const { page, limit } = paginationDto;
    const {
      requerido_aseo_hoy,
      requerido_desinfeccion_hoy,
      requerido_rotacion_colchones,
      ultimo_aseo_tipo,
    } = filtrosAseoDto;

    // Construir filtros WHERE
    const whereConditions: any = {
      deleted: false,
    };

    // Aplicar filtros específicos
    if (requerido_aseo_hoy !== undefined) {
      whereConditions.requerido_aseo_hoy = requerido_aseo_hoy;
    }

    if (requerido_desinfeccion_hoy !== undefined) {
      whereConditions.requerido_desinfeccion_hoy = requerido_desinfeccion_hoy;
    }

    if (requerido_rotacion_colchones !== undefined) {
      whereConditions.requerido_rotacion_colchones =
        requerido_rotacion_colchones;
    }

    if (ultimo_aseo_tipo !== undefined) {
      whereConditions.ultimo_aseo_tipo = ultimo_aseo_tipo;
    }

    const total = await this.prisma.habitacion.count({
      where: whereConditions,
    });

    const lastPage = Math.ceil(total / limit);

    const emptyData = emptyPaginationResponse(page, limit, total, lastPage);

    if (total === 0 || page > emptyData.meta.lastPage) return emptyData;

    const habitaciones = await this.prisma.habitacion.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereConditions,
      select: {
        id: true,
        numero_habitacion: true,
        tipo: true,
        estado: true,
        ultimo_aseo_fecha: true,
        ultimo_aseo_tipo: true,
        ultima_rotacion_colchones: true,
        proxima_rotacion_colchones: true,
        requerido_aseo_hoy: true,
        requerido_desinfeccion_hoy: true,
        requerido_rotacion_colchones: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { requerido_aseo_hoy: 'desc' },
        { requerido_desinfeccion_hoy: 'desc' },
        { requerido_rotacion_colchones: 'desc' },
        { numero_habitacion: 'asc' },
      ],
    });

    return {
      data: habitaciones,
      meta: { page, limit, total, lastPage },
    };
  }
}
