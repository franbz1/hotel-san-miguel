import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';
import { Prisma } from '@prisma/client';
import { UpdateReservaWithHuespedesSecundariosDto } from './dto/updateReservaWithHuespedesSecundariosDto';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva reserva
   * @param createReservaDto Datos para crear la reserva
   * @returns La reserva creada
   * @throws BadRequestException si no se proporcionan datos para crear la reserva
   */
  async create(createReservaDto: CreateReservaDto) {
    try {
      return await this.prisma.reserva.create({
        data: createReservaDto,
      });
    } catch (error) {
      if (error.code === 'P2003')
        throw new BadRequestException(
          'El huesped no existe o no se encontró la habitación',
        );
      throw error;
    }
  }

  async createTransaction(
    createReservaDto: CreateReservaDto,
    facturaId: number,
    tx: Prisma.TransactionClient,
  ) {
    try {
      return await tx.reserva.create({
        data: {
          ...createReservaDto,
          facturaId,
        },
      });
    } catch (error) {
      if (error.code === 'P2003')
        throw new BadRequestException(
          'El huesped no existe o no se encontró la habitación',
        );
      throw error;
    }
  }

  /**
   * Obtiene todas las reservas con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de reservas y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalReservas = await this.prisma.reserva.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalReservas / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalReservas,
      lastPage,
    );

    if (totalReservas === 0 || page > emptyData.meta.lastPage) return emptyData;

    const reservas = await this.prisma.reserva.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
    });

    return { data: reservas, meta: { page, limit, totalReservas, lastPage } };
  }

  /**
   * Busca una reserva por su ID.
   * @param id ID de la reserva.
   * @returns La reserva encontrada.
   * @throws NotFoundException si la reserva no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.reserva.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Actualiza los datos de una reserva por su ID.
   * @param id ID de la reserva.
   * @param updateReservaDto Datos para actualizar.
   * @returns La reserva actualizada.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si la reserva no existe.
   */
  async update(id: number, updateReservaDto: UpdateReservaDto) {
    if (!Object.keys(updateReservaDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar la reserva.',
      );
    }

    try {
      return await this.prisma.reserva.update({
        where: { id, deleted: false },
        data: updateReservaDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  async UpdateTransaction(
    updateReservaDto: UpdateReservaWithHuespedesSecundariosDto,
    tx: Prisma.TransactionClient,
    id: number,
  ) {
    const { huespedes_secundarios, ...rest } = updateReservaDto;
    try {
      return await tx.reserva.update({
        where: { id: id },
        data: {
          ...rest,
          huespedes_secundarios: {
            connect: huespedes_secundarios,
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina una reserva por su ID.
   * @param id ID de la reserva.
   * @returns La reserva eliminada.
   * @throws NotFoundException si la reserva no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.reserva.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  async removeTx(id: number, tx: Prisma.TransactionClient) {
    try {
      return await tx.reserva.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }
}
