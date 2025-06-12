import { Injectable } from '@nestjs/common';
import { CreateZonasComuneDto } from './dto/create-zonas-comune.dto';
import { UpdateZonasComuneDto } from './dto/update-zonas-comune.dto';

@Injectable()
export class ZonasComunesService {
  create(createZonasComuneDto: CreateZonasComuneDto) {
    return 'This action adds a new zonasComune';
  }

  findAll() {
    return `This action returns all zonasComunes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zonasComune`;
  }

  update(id: number, updateZonasComuneDto: UpdateZonasComuneDto) {
    return `This action updates a #${id} zonasComune`;
  }

  remove(id: number) {
    return `This action removes a #${id} zonasComune`;
  }
}
