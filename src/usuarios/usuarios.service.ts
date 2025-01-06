import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import notFoundError from 'src/common/errors/notfoundError';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';

/**
 * Service CRUD para manejar usuarios
 */
@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo usuario.
   * @param createUsuarioDto Datos del usuario a crear.
   * @returns El usuario creado.
   */
  async create(createUsuarioDto: CreateUsuarioDto) {
    return await this.prisma.usuario.create({
      data: createUsuarioDto,
      select: this.defaultUserSelection(),
    });
  }

  /**
   * Obtiene todos los usuarios con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de usuarios y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalUsuarios = await this.prisma.usuario.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalUsuarios / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalUsuarios,
      lastPage,
    );

    if (totalUsuarios === 0 || page > emptyData.meta.lastPage) return emptyData;

    const usuarios = await this.prisma.usuario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
      select: this.defaultUserSelection(),
    });

    return { data: usuarios, meta: { page, limit, totalUsuarios, lastPage } };
  }

  /**
   * Busca un usuario por su ID.
   * @param id ID del usuario.
   * @returns El usuario encontrado.
   * @throws NotFoundException si el usuario no existe.
   */
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, deleted: false },
      select: this.defaultUserSelection(),
    });

    if (!usuario) throw notFoundError(id);

    return usuario;
  }

  /**
   * Actualiza los datos de un usuario por su ID.
   * @param id ID del usuario.
   * @param updateUsuarioDto Datos para actualizar.
   * @returns El usuario actualizado.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si el usuario no existe.
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    if (!Object.keys(updateUsuarioDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar el usuario.',
      );
    }

    try {
      return await this.prisma.usuario.update({
        where: { id, deleted: false },
        data: updateUsuarioDto,
        select: this.defaultUserSelection(),
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);

      throw error;
    }
  }

  /**
   * Elimina (soft delete) un usuario por su ID.
   * @param id ID del usuario.
   * @returns El usuario eliminado.
   * @throws NotFoundException si el usuario no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.usuario.update({
        where: { id, deleted: false },
        data: { deleted: true },
        select: this.defaultUserSelection(),
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Selección predeterminada para los campos del usuario.
   * @returns Objeto de selección para Prisma.
   */
  private defaultUserSelection() {
    return {
      id: true,
      nombre: true,
      rol: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
