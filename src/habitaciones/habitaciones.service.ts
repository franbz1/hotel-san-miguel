import { Injectable } from '@nestjs/common';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';

@Injectable()
export class HabitacionesService {
  create(createHabitacionDto: CreateHabitacionDto) {
    return 'This action adds a new habitacione';
  }

  findAll() {
    return `This action returns all habitaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} habitacione`;
  }

  update(id: number, updateHabitacionDto: UpdateHabitacionDto) {
    return `This action updates a #${id} habitacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} habitacione`;
  }
}
