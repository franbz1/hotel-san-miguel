import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import notFoundError from 'src/common/errors/notfoundError';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';

/**
 * Service para manejar los documentos subidos por el huesped
 */
@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo documento.
   * @param createDocumentoDto Datos del documento a crear.
   * @returns El documento creado.
   */
  async create(createDocumentoDto: CreateDocumentoDto) {
    const { huespedId, huespedSecundarioId } = createDocumentoDto;
    try {
      return await this.prisma.documento.create({
        data: createDocumentoDto,
      });
    } catch (error) {
      if (error.code === 'P2003') {
        if (huespedId) throw notFoundError(huespedId);
        if (huespedSecundarioId) throw notFoundError(huespedSecundarioId);
      }
      throw error;
    }
  }

  /**
   * Busca todos los documentos por el id del huesped
   * @param huespedId
   * @param paginationDto datos de paginación
   * @returns Documentos[] con los documentos y metadatos de paginación
   */
  async findAll(huespedId: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalDocs = await this.prisma.documento.count({
      where: { huespedId },
    });

    const lastPage = Math.ceil(totalDocs / limit);

    const emptyData = emptyPaginationResponse(page, limit, totalDocs, lastPage);

    if (totalDocs === 0 || page > emptyData.meta.lastPage) return emptyData;

    const docs = await this.prisma.documento.findMany({
      where: { huespedId },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: docs, meta: { page, limit, total: totalDocs, lastPage } };
  }

  /**
   * Busca un documento por su ID.
   * @param id ID del documento.
   * @returns El documento encontrado.
   * @throws NotFoundException si el documento no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.documento.findFirstOrThrow({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un documento por su ID.
   * @param id ID del documento.
   * @param updateDocumentoDto Datos para actualizar.
   * @returns El documento actualizado.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si el documento no existe.
   */
  async update(id: number, updateDocumentoDto: UpdateDocumentoDto) {
    if (!Object.keys(updateDocumentoDto).length)
      throw new BadRequestException(
        'Debe enviar datos para actualizar el documento.',
      );

    try {
      return await this.prisma.documento.update({
        where: { id },
        data: updateDocumentoDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina un documento por su ID.
   * @param id ID del documento.
   * @returns El documento eliminado.
   * @throws NotFoundException si el documento no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.documento.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina todos los documentos de un huesped.
   * @param huespedId ID del huesped.
   * @returns El número de documentos eliminados.
   * @throws NotFoundException si el huesped no existe.
   */
  async removeAllByHuespedId(huespedId: number) {
    try {
      return await this.prisma.documento.deleteMany({
        where: { huespedId },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(huespedId);
      throw error;
    }
  }
}
