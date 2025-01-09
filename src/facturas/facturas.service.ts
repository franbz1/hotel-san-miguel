import { Injectable } from '@nestjs/common';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';

@Injectable()
export class FacturasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nueva factura.
   * @param createFacturaDto Datos de la factura a crear.
   * @returns La factura creada.
   */
  async create(createFacturaDto: CreateFacturaDto) {
    return await this.prisma.factura.create({
      data: createFacturaDto,
    });
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

  findOne(id: number) {
    return `This action returns a #${id} factura`;
  }

  update(id: number, updateFacturaDto: UpdateFacturaDto) {
    return `This action updates a #${id} factura`;
  }

  remove(id: number) {
    return `This action removes a #${id} factura`;
  }
}
