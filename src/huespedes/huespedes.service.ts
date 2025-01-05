import { Injectable } from '@nestjs/common';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedeDto } from './dto/update-huespede.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import notFoundError from 'src/common/errors/notfoundError';
import { DocumentosService } from 'src/documentos/documentos.service';

@Injectable()
export class HuespedesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentosService: DocumentosService,
  ) {}

  async create(CreateHuespedDto: CreateHuespedDto) {
    return await this.prisma.huesped.create({
      data: CreateHuespedDto,
    });
  }

  findAll() {
    return `This action returns all huespedes`;
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
