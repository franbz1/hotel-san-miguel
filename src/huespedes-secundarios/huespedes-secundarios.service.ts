import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class HuespedesSecundariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    try {
      return await this.prisma.huespedSecundario.create({
        data: CreateHuespedSecundarioDto,
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('El huespedId no es valido');
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all huespedesSecundarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} huespedesSecundario`;
  }

  update(id: number, UpdateHuespedSecundarioDto: UpdateHuespedSecundarioDto) {
    return `This action updates a #${id} huespedesSecundario`;
  }

  remove(id: number) {
    return `This action removes a #${id} huespedesSecundario`;
  }
}
