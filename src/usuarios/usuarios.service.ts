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

    if (totalUsuarios === 0) return this.emptyPaginationResponse(page, limit);

    const lastPage = Math.ceil(totalUsuarios / limit);

    if (page > lastPage) return this.emptyPaginationResponse(page, limit);

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

    if (!usuario) throw this.notFoundError(id);

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
      if (error.code === 'P2025') throw this.notFoundError(id);

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
      if (error.code === 'P2025') throw this.notFoundError(id);
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

  /**
   * Respuesta de paginación vacía.
   * @param page Página actual.
   * @param limit Límite de registros por página.
   * @param totalUsuarios Número total de usuarios (opcional).
   * @param lastPage Última página (opcional).
   * @returns Objeto con datos vacíos y metadatos de paginación.
   */
  private emptyPaginationResponse(
    page: number,
    limit: number,
    totalUsuarios = 0,
    lastPage = 0,
  ) {
    return { data: [], meta: { page, limit, totalUsuarios, lastPage } };
  }

  /**
   * Error de Usuario no encontrado customizado.
   * @param id ID del usuario.
   * @returns Objeto con el mensaje de error.
   */
  private notFoundError(id: number) {
    return new NotFoundException(`No se encontró el usuario con ID: ${id}`);
  }
}
