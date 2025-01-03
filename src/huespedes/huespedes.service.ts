import { Injectable } from '@nestjs/common';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedeDto } from './dto/update-huespede.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class HuespedesService {
  constructor(private readonly prisma: PrismaService) {}

  create(CreateHuespedDto: CreateHuespedDto) {
    return this.prisma.huesped.create({
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

  remove(id: number) {
    return `This action removes a #${id} huespede`;
  }
}
