import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';
import { Prisma } from '@prisma/client';

@Injectable()
export class HuespedesSecundariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un huesped secundario
   * @param CreateHuespedSecundarioDto
   * @returns El huesped secundario creado
   * @throws BadRequestException si el huespedId no es valido o el numero de documento ya existe
   */
  async create(CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    try {
      return await this.prisma.huespedSecundario.create({
        data: CreateHuespedSecundarioDto,
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('El huespedId no es valido');
      } else if (error.code === 'P2002') {
        throw new BadRequestException('El numero de documento ya existe');
      }
      throw error;
    }
  }

  /**
   * Devuelve todos los huespedes secundarios con paginación
   * @param PaginationDto Datos de paginación
   * @returns Objeto con la lista de huespedes secundarios y metadatos de paginación
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalHuespedesSecundarios = await this.prisma.huespedSecundario.count(
      {
        where: { deleted: false },
      },
    );

    const lastPage = Math.ceil(totalHuespedesSecundarios / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalHuespedesSecundarios,
      lastPage,
    );

    if (totalHuespedesSecundarios === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const huespedesSecundarios = await this.prisma.huespedSecundario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
    });

    return {
      data: huespedesSecundarios,
      meta: { page, limit, total: totalHuespedesSecundarios, lastPage },
    };
  }

  /**
   * Busca todos los huespedes secundarios de un huesped
   * @param huespedId ID del huesped principal
   * @param PaginationDto Datos de paginación
   * @returns Lista de huespedes secundarios
   */
  async findAllHuespedesSecundariosByHuespedId(
    huespedId: number,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;

    const totalHuespedesSecundarios = await this.prisma.huespedSecundario.count(
      {
        where: { huespedId, deleted: false },
      },
    );

    const lastPage = Math.ceil(totalHuespedesSecundarios / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalHuespedesSecundarios,
      lastPage,
    );

    if (totalHuespedesSecundarios === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const huespedesSecundarios = await this.prisma.huespedSecundario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { huespedId, deleted: false },
    });

    return {
      data: huespedesSecundarios,
      meta: { page, limit, total: totalHuespedesSecundarios, lastPage },
    };
  }

  /**
   * Busca un huesped secundario por su ID
   * @param id ID del huesped secundario
   * @returns El huesped secundario encontrado
   * @throws BadRequestException si el huesped secundario no existe
   */
  async findOne(id: number) {
    try {
      return await this.prisma.huespedSecundario.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Busca un huesped secundario por su numero de documento
   * @param numeroDocumento Numero de documento del huesped secundario
   * @returns El huesped secundario encontrado
   * @throws BadRequestException si el huesped secundario no existe
   */
  async findByNumeroDocumento(numeroDocumento: string) {
    try {
      return await this.prisma.huespedSecundario.findFirstOrThrow({
        where: { numero_documento: numeroDocumento, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException('El numero de documento no existe');
      }
      throw error;
    }
  }

  /**
   * Actualiza los datos de un huesped secundario por su ID
   * @param id ID del huesped secundario
   * @param UpdateHuespedSecundarioDto Datos para actualizar
   * @returns El huesped secundario actualizado
   * @throws BadRequestException si no se proporcionan datos para actualizar
   * @throws NotFoundException si el huesped secundario no existe
   */
  async update(
    id: number,
    UpdateHuespedSecundarioDto: UpdateHuespedSecundarioDto,
  ) {
    if (!Object.keys(UpdateHuespedSecundarioDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar el huesped secundario',
      );
    }

    try {
      return await this.prisma.huespedSecundario.update({
        where: { id, deleted: false },
        data: UpdateHuespedSecundarioDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina un huesped secundario por su ID
   * @param id ID del huesped secundario
   * @returns El huesped secundario eliminado
   * @throws NotFoundException si el huesped secundario no existe
   */
  async remove(id: number) {
    try {
      return await this.prisma.huespedSecundario.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina un huésped secundario por su ID dentro de una transacción.
   * @param id ID del huésped secundario.
   * @param tx Cliente de transacción de Prisma.
   * @returns El huésped secundario eliminado.
   * @throws NotFoundException si el huésped secundario no existe.
   */
  async removeTx(id: number, tx: Prisma.TransactionClient) {
    try {
      return await tx.huespedSecundario.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Verifica si un huésped secundario tiene reservas activas.
   * @param huespedSecundarioId ID del huésped secundario.
   * @param tx Cliente de transacción de Prisma.
   * @returns true si tiene reservas activas, false en caso contrario.
   */
  async hasActiveReservationsTx(
    huespedSecundarioId: number,
    tx: Prisma.TransactionClient,
  ): Promise<boolean> {
    const count = await tx.reserva.count({
      where: {
        huespedes_secundarios: {
          some: {
            id: huespedSecundarioId,
            deleted: false,
          },
        },
        deleted: false,
      },
    });
    return count > 0;
  }

  /**
   * Elimina un huésped secundario solo si no tiene reservas activas, dentro de una transacción.
   * @param huespedSecundarioId ID del huésped secundario.
   * @param tx Cliente de transacción de Prisma.
   * @returns El huésped secundario eliminado o null si no se eliminó.
   */
  async removeIfNoActiveReservationsTx(
    huespedSecundarioId: number,
    tx: Prisma.TransactionClient,
  ) {
    const hasActiveReservations = await this.hasActiveReservationsTx(
      huespedSecundarioId,
      tx,
    );

    if (!hasActiveReservations) {
      return await this.removeTx(huespedSecundarioId, tx);
    }

    return null;
  }

  async createManyTransaction(
    huespedesSecundarios: CreateHuespedSecundarioDto[],
    tx: Prisma.TransactionClient,
  ) {
    try {
      return await tx.huespedSecundario.createManyAndReturn({
        data: huespedesSecundarios,
        skipDuplicates: true,
      });
    } catch (error) {
      throw error;
    }
  }
}
