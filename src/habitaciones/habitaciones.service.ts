import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class HabitacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva habitación.
   * @param createHabitacionDto Datos de la habitación a crear.
   * @returns La habitación creada.
   */
  async create(createHabitacionDto: CreateHabitacionDto) {
    try {
      return await this.prisma.habitacion.create({
        data: createHabitacionDto,
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new BadRequestException(
          'Ya existe una habitación con ese número',
        );
      throw error;
    }
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
