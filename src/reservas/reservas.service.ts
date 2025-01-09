import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva reserva
   * @param createReservaDto Datos para crear la reserva
   * @returns La reserva creada
   * @throws BadRequestException si no se proporcionan datos para crear la reserva
   */
  async create(createReservaDto: CreateReservaDto) {
    try {
      return await this.prisma.reserva.create({
        data: createReservaDto,
      });
    } catch (error) {
      if (error.code === 'P2003')
        throw new BadRequestException(
          'El huesped no existe o no se encontró la habitación',
        );
      throw error;
    }
  }

  findAll() {
    return `This action returns all reservas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reserva`;
  }

  update(id: number, updateReservaDto: UpdateReservaDto) {
    return `This action updates a #${id} reserva`;
  }

  remove(id: number) {
    return `This action removes a #${id} reserva`;
  }
}
