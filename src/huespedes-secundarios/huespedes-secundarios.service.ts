import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';

@Injectable()
export class HuespedesSecundariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un huesped secundario
   * @param CreateHuespedSecundarioDto
   * @returns El huesped secundario creado
   * @throws BadRequestException si el huespedId no es valido o el numero de documento ya existe
   */
  async create(CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    try {
      return await this.prisma.huespedSecundario.create({
        data: CreateHuespedSecundarioDto,
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('El huespedId no es valido');
      } else if (error.code === 'P2002') {
        throw new BadRequestException('El numero de documento ya existe');
      }
      throw error;
    }
  }

  /**
   * Devuelve todos los huespedes secundarios con paginación
   * @param PaginationDto Datos de paginación
   * @returns Objeto con la lista de huespedes secundarios y metadatos de paginación
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalHuespedesSecundarios = await this.prisma.huespedSecundario.count(
      {
        where: { deleted: false },
      },
    );

    const lastPage = Math.ceil(totalHuespedesSecundarios / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalHuespedesSecundarios,
      lastPage,
    );

    if (totalHuespedesSecundarios === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const huespedesSecundarios = await this.prisma.huespedSecundario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
    });

    return {
      data: huespedesSecundarios,
      meta: { page, limit, totalHuespedesSecundarios, lastPage },
    };
  }

  /**
   * Busca todos los huespedes secundarios de un huesped
   * @param huespedId ID del huesped principal
   * @param PaginationDto Datos de paginación
   * @returns Lista de huespedes secundarios
   */
  async findAllHuespedesSecundariosByHuespedId(
    huespedId: number,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;

    const totalHuespedesSecundarios = await this.prisma.huespedSecundario.count(
      {
        where: { huespedId, deleted: false },
      },
    );

    const lastPage = Math.ceil(totalHuespedesSecundarios / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalHuespedesSecundarios,
      lastPage,
    );

    if (totalHuespedesSecundarios === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const huespedesSecundarios = await this.prisma.huespedSecundario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { huespedId, deleted: false },
    });

    return {
      data: huespedesSecundarios,
      meta: { page, limit, totalHuespedesSecundarios, lastPage },
    };
  }

  /**
   * Busca un huesped secundario por su ID
   * @param id ID del huesped secundario
   * @returns El huesped secundario encontrado
   * @throws BadRequestException si el huesped secundario no existe
   */
  async findOne(id: number) {
    return `This action returns a #${id} huespedesSecundario`;
  }

  update(id: number, UpdateHuespedSecundarioDto: UpdateHuespedSecundarioDto) {
    return `This action updates a #${id} huespedesSecundario`;
  }

  remove(id: number) {
    return `This action removes a #${id} huespedesSecundario`;
  }
}
