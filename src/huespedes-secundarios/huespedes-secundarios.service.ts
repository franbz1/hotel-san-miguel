import { Injectable } from '@nestjs/common';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';

@Injectable()
export class HuespedesSecundariosService {
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
