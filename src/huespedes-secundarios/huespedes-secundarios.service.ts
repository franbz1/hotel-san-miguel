import { Injectable } from '@nestjs/common';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class HuespedesSecundariosService {
  constructor(private readonly prisma: PrismaService) {}

  create(CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    return 'This action adds a new huespedesSecundario';
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
