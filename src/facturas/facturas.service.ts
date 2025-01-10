import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';

@Injectable()
export class FacturasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nueva factura.
   * @param createFacturaDto Datos de la factura a crear.
   * @returns La factura creada.
   */
  async create(createFacturaDto: CreateFacturaDto) {
    try {
      return await this.prisma.factura.create({
        data: createFacturaDto,
      });
    } catch (error) {
      if (error.code === 'P2003')
        throw notFoundError(createFacturaDto.huespedId);
      throw error;
    }
  }

  /**
   * Obtiene todas las facturas con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de facturas y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalFacturas = await this.prisma.factura.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalFacturas / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalFacturas,
      lastPage,
    );

    if (totalFacturas === 0 || page > emptyData.meta.lastPage) return emptyData;

    const facturas = await this.prisma.factura.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
    });

    return { data: facturas, meta: { page, limit, totalFacturas, lastPage } };
  }

  /**
   * Busca una factura por su ID.
   * @param id ID de la factura.
   * @returns La factura encontrada.
   * @throws NotFoundException si la factura no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.factura.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Actualiza los datos de una factura por su ID.
   * @param id ID de la factura.
   * @param updateFacturaDto Datos para actualizar.
   * @returns La factura actualizada.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si la factura no existe.
   */
  async update(id: number, updateFacturaDto: UpdateFacturaDto) {
    if (!Object.keys(updateFacturaDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar la factura.',
      );
    }

    try {
      return await this.prisma.factura.update({
        where: { id, deleted: false },
        data: updateFacturaDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina una factura por su ID.
   * @param id ID de la factura.
   * @returns La factura eliminada.
   * @throws NotFoundException si la factura no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.factura.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }
}
