import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateFormularioDto } from './dto/update-formulario.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';

@Injectable()
export class FormulariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los formularios con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de formularios y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalFormularios = await this.prisma.formulario.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalFormularios / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalFormularios,
      lastPage,
    );

    if (totalFormularios === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const formularios = await this.prisma.formulario.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: formularios,
      meta: { page, limit, totalFormularios, lastPage },
    };
  }

  /**
   * Obtiene un formulario por su ID.
   * @param id ID del formulario.
   * @returns El formulario encontrado.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.formulario.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Actualiza un formulario por su ID.
   * @param id ID del formulario.
   * @param updateFormularioDto Datos para actualizar.
   * @returns El formulario actualizado.
   */
  async update(id: number, updateFormularioDto: UpdateFormularioDto) {
    if (!Object.keys(updateFormularioDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar el formulario.',
      );
    }

    try {
      return await this.prisma.formulario.update({
        where: { id, deleted: false },
        data: updateFormularioDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina un formulario por su ID.
   * @param id ID del formulario.
   * @returns El formulario eliminado.
   */
  async remove(id: number) {
    try {
      return await this.prisma.formulario.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }
}
