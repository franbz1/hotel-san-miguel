import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedeDto } from './dto/update-huespede.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import notFoundError from 'src/common/errors/notfoundError';
import { DocumentosService } from 'src/documentos/documentos.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';

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
        throw new BadRequestException('El huesped ya existe');
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
    });

    return { data: huespedes, meta: { page, limit, totalHuespedes, lastPage } };
  }

  findOne(id: number) {
    return `This action returns a #${id} huespede`;
  }

  update(id: number, updateHuespedeDto: UpdateHuespedeDto) {
    return `This action updates a #${id} huespede`;
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
}
