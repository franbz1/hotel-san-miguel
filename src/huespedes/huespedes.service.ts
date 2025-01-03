import { Injectable } from '@nestjs/common';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedeDto } from './dto/update-huespede.dto';

@Injectable()
export class HuespedesService {
  create(CreateHuespedDto: CreateHuespedDto) {
    return 'This action adds a new huespede';
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
