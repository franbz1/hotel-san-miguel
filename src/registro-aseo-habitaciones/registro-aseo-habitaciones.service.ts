import { Injectable } from '@nestjs/common';
import { CreateRegistroAseoHabitacioneDto } from './dto/create-registro-aseo-habitacione.dto';
import { UpdateRegistroAseoHabitacioneDto } from './dto/update-registro-aseo-habitacione.dto';

@Injectable()
export class RegistroAseoHabitacionesService {
  create(createRegistroAseoHabitacioneDto: CreateRegistroAseoHabitacioneDto) {
    return 'This action adds a new registroAseoHabitacione';
  }

  findAll() {
    return `This action returns all registroAseoHabitaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registroAseoHabitacione`;
  }

  update(id: number, updateRegistroAseoHabitacioneDto: UpdateRegistroAseoHabitacioneDto) {
    return `This action updates a #${id} registroAseoHabitacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} registroAseoHabitacione`;
  }
}
