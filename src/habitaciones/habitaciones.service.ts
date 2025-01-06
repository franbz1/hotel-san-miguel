import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';

@Injectable()
export class HabitacionesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
