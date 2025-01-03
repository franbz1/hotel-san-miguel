import { Injectable } from '@nestjs/common';
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
    try {
      return await this.prisma.documento.create({
        data: createDocumentoDto,
      });
    } catch (error) {
      if (error.code === 'P2003') notFoundError(createDocumentoDto.huespedId);
      console.log(error);
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

  findOne(id: number) {
    return `This action returns a #${id} documento`;
  }

  update(id: number, updateDocumentoDto: UpdateDocumentoDto) {
    return `This action updates a #${id} documento`;
  }

  remove(id: number) {
    return `This action removes a #${id} documento`;
  }
}
