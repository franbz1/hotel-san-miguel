import { Injectable } from '@nestjs/common';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

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

  findAll() {
    return `This action returns all facturas`;
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
