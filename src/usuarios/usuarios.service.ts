import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    if (totalUsuarios === 0) {
      return { data: [], meta: { page, limit, totalUsuarios, lastPage: 0 } };
    }

    const lastPage = Math.ceil(totalUsuarios / limit);

    if (page > lastPage) {
      return { data: [], meta: { page, limit, totalUsuarios, lastPage } };
    }

    const usuarios = await this.prisma.usuario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
      select: {
        id: true,
        nombre: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data: usuarios, meta: { page, limit, totalUsuarios, lastPage } };
  }

  /**
   * Busca un usuario por id
   * @param id
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
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id, deleted: false },
      select: {
        id: true,
        nombre: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con id: ${id}`);
    }

    return usuario;
  }

  /**
   * Actualiza un usuario por id
   * @param id
   * @param updateUsuarioDto
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
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    if (Object.keys(updateUsuarioDto).length === 0) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar el usuario',
      );
    }
    try {
      return await this.prisma.usuario.update({
        where: { id, deleted: false },
        data: updateUsuarioDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`No se encontró el usuario con id: ${id}`);
      } else {
        throw error;
      }
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.usuario.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`No se encontró el usuario con id: ${id}`);
      } else {
        throw error;
      }
    }
  }
}
