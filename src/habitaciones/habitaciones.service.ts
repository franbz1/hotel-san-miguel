import { BadRequestException, Injectable } from '@nestjs/common';
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

  update(id: number, updateHabitacionDto: UpdateHabitacionDto) {
    return `This action updates a #${id} habitacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} habitacione`;
  }
}
