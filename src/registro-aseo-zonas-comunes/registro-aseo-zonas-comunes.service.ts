import { Injectable } from '@nestjs/common';
import { CreateRegistroAseoZonasComuneDto } from './dto/create-registro-aseo-zonas-comune.dto';
import { UpdateRegistroAseoZonasComuneDto } from './dto/update-registro-aseo-zonas-comune.dto';

@Injectable()
export class RegistroAseoZonasComunesService {
  create(createRegistroAseoZonasComuneDto: CreateRegistroAseoZonasComuneDto) {
    return 'This action adds a new registroAseoZonasComune';
  }

  findAll() {
    return `This action returns all registroAseoZonasComunes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registroAseoZonasComune`;
  }

  update(id: number, updateRegistroAseoZonasComuneDto: UpdateRegistroAseoZonasComuneDto) {
    return `This action updates a #${id} registroAseoZonasComune`;
  }

  remove(id: number) {
    return `This action removes a #${id} registroAseoZonasComune`;
  }
}
