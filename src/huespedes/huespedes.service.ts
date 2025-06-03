import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedDto } from './dto/update-huesped.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import notFoundError from 'src/common/errors/notfoundError';
import { DocumentosService } from 'src/documentos/documentos.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import { Huesped, Prisma } from '@prisma/client';

@Injectable()
export class HuespedesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentosService: DocumentosService,
  ) {}

  /**
   * Crea un nuevo huesped.
   * @param createHuespedDto Datos del huesped a crear.
   * @returns El huesped creado.
   */
  async create(CreateHuespedDto: CreateHuespedDto) {
    try {
      return await this.prisma.huesped.create({
        data: CreateHuespedDto,
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new BadRequestException('El huésped ya existe');
      throw error;
    }
  }

  /**
   * Obtiene todos los huespedes con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de huespedes y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalHuespedes = await this.prisma.huesped.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalHuespedes / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalHuespedes,
      lastPage,
    );

    if (totalHuespedes === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const huespedes = await this.prisma.huesped.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
      include: {
        reservas: {
          where: {
            deleted: false,
          },
        },
      },
    });

    return { data: huespedes, meta: { page, limit, totalHuespedes, lastPage } };
  }

  /**
   * Busca un huesped por su ID.
   * @param id ID del huesped.
   * @returns El huesped encontrado.
   * @throws NotFoundException si el huesped no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.huesped.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Busca un huesped por su numero de Documento.
   * @param documentoId ID del documento.
   * @returns El huesped encontrado.
   * @throws NotFoundException si el huesped no existe.
   */
  async findByDocumentoId(documentoId: string) {
    try {
      return await this.prisma.huesped.findFirstOrThrow({
        where: { numero_documento: documentoId, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException(
          `No se encontró el huésped con el numero de documento: ${documentoId}`,
        );
      throw error;
    }
  }

  /**
   * Actualiza los datos de un huesped por su ID.
   * @param id ID del huesped.
   * @param updateHuespedeDto Datos para actualizar.
   * @returns El huesped actualizado.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si el huesped no existe.
   */
  async update(id: number, updateHuespedDto: UpdateHuespedDto) {
    if (!Object.keys(updateHuespedDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar el huésped.',
      );
    }

    try {
      return await this.prisma.huesped.update({
        where: { id, deleted: false },
        data: updateHuespedDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina un huesped por su ID y sus documentos.
   * @param id ID del huesped.
   * @returns El huesped eliminado.
   * @throws NotFoundException si el huesped no existe.
   */
  async remove(id: number) {
    try {
      const huesped = await this.prisma.huesped.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
      await this.documentosService.removeAllByHuespedId(huesped.id);
      return huesped;
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Busca y devuelve el huesped de la base de datos, si no lo encuentra lo crea.
   * Si existe un huésped eliminado con el mismo número de documento, lo reactiva.
   * @param dto Dto del huesped a crear
   * @returns El huesped creado o reactivado
   */
  async findOrCreateHuesped(dto: CreateHuespedDto): Promise<Huesped> {
    try {
      // Buscar huésped activo primero
      const huesped = await this.prisma.huesped.findFirst({
        where: { numero_documento: dto.numero_documento, deleted: false },
      });

      if (huesped) {
        return huesped;
      }

      // Verificar si existe un huésped eliminado para reutilizar
      const huespedEliminado = await this.prisma.huesped.findFirst({
        where: { numero_documento: dto.numero_documento, deleted: true },
      });

      if (huespedEliminado) {
        // Reactivar huésped eliminado actualizando todos sus datos
        return await this.prisma.huesped.update({
          where: { id: huespedEliminado.id },
          data: {
            ...dto,
            deleted: false,
            updatedAt: new Date(),
          },
        });
      }

      // Si no existe ningún huésped, crear uno nuevo
      return await this.prisma.huesped.create({
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Error de integridad: No se pudo procesar el huésped',
        );
      }
      throw error;
    }
  }

  /**
   * Busca y devuelve el huesped de la base de datos dentro de una transacción,
   * si no lo encuentra lo crea. Si existe un huésped eliminado con el mismo
   * número de documento, lo reactiva.
   * @param dto Dto del huesped a crear
   * @param tx Cliente de transacción de Prisma
   * @returns El huesped creado o reactivado
   */
  async findOrCreateHuespedTransaction(
    dto: CreateHuespedDto,
    tx: Prisma.TransactionClient,
  ): Promise<Huesped> {
    try {
      // Buscar huésped activo primero
      const huesped = await tx.huesped.findFirst({
        where: { numero_documento: dto.numero_documento, deleted: false },
      });

      if (huesped) {
        return huesped;
      }

      // Verificar si existe un huésped eliminado para reutilizar
      const huespedEliminado = await tx.huesped.findFirst({
        where: { numero_documento: dto.numero_documento, deleted: true },
      });

      if (huespedEliminado) {
        // Reactivar huésped eliminado actualizando todos sus datos
        return await tx.huesped.update({
          where: { id: huespedEliminado.id },
          data: {
            ...dto,
            deleted: false,
            updatedAt: new Date(),
          },
        });
      }

      // Si no existe ningún huésped, crear uno nuevo
      return await tx.huesped.create({
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Error de integridad: No se pudo procesar el huésped en la transacción',
        );
      }
      throw error;
    }
  }
}
