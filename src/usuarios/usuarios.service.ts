import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/usuarios/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';

/**
 * Service CRUD para manejar usuarios
 */
@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Método para crear un usuario
   * @param createUsuarioDto
   * @returns Usuario
   * @example
   * {
   *   id: Int,
   *   nombre: string,
   *   rol: string,
   *   createdAt: DateTime,
   *   updatedAt: DateTime
   * }
   */
  async create(createUsuarioDto: CreateUsuarioDto) {
    return await this.prisma.usuario.create({
      data: createUsuarioDto,
    });
  }

  /**
   * Método para obtener todos los usuarios con paginación
   * @param paginationDto
   * @returns Objeto con los usuarios y metadatos de paginación
   * @example
   * {
   *   data: [Usuario],
   *   meta: {
   *     page: number,
   *     limit: number,
   *     totalUsuarios: number,
   *     lastPage: number
   *   }
   * }
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalUsuarios = await this.prisma.usuario.count();

    const lastPage = Math.ceil(totalUsuarios / limit);

    if (page > lastPage) {
      return { data: [], meta: { page, limit, totalUsuarios, lastPage } };
    }

    const usuarios = await this.prisma.usuario.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: usuarios, meta: { page, limit, totalUsuarios, lastPage } };
  }
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
