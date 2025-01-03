import { Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import notFoundError from 'src/common/errors/notfoundError';

/**
 * Service para manejar los documentos subidos por el huesped
 */
@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

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
   * @returns Documentos[]
   */
  findAll(huespedId: number) {
    return `This action returns all documentos`;
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
