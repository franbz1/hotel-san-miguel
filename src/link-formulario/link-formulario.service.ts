import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FRONTEND_URL } from 'src/common/constants/domain';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Role } from 'src/usuarios/entities/rol.enum';
import { UpdateLinkFormularioDto } from './dto/UpdateLinkFormularioDto';
import notFoundError from 'src/common/errors/notfoundError';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import { CreateLinkFormularioDto } from './dto/CreateLinkFormularioDto';
import { BlacklistService } from 'src/auth/blacklist.service';

@Injectable()
export class LinkFormularioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
  ) {}

  /**
   * Crea un link temporal para el formulario de reserva, el cual contiene un jwt valido
   * @returns Link temporal
   */
  async createLinkTemporal(createLinkFormularioDto: CreateLinkFormularioDto) {
    const ruta = `${FRONTEND_URL}/registro-formulario/`;

    // Usar transacción para operación atómica
    return await this.prisma.$transaction(async (tx) => {
      // Verificar habitación existe
      let habitacion;
      try {
        habitacion = await tx.habitacion.findFirstOrThrow({
          where: {
            numero_habitacion: createLinkFormularioDto.numeroHabitacion,
            deleted: false,
          },
        });
      } catch (error) {
        if (error.code === 'P2025')
          throw notFoundError(createLinkFormularioDto.numeroHabitacion);
        throw error;
      }

      const hoy = new Date(new Date().toISOString());
      const vencimiento = new Date(hoy.getTime() + 3600 * 1000);

      // Generar token primero para crear link completo
      const tempPayload = {
        id: Date.now(), // ID temporal para generar token
        rol: Role.REGISTRO_FORMULARIO,
      };

      const tempToken = await this.jwtService.signAsync(tempPayload, {
        expiresIn: '1h',
      });

      // Crear link con URL completa desde el inicio
      const link = await tx.linkFormulario.create({
        data: {
          url: `${ruta}${tempToken}`,
          vencimiento: vencimiento,
          numeroHabitacion: habitacion.numero_habitacion,
          fechaInicio: createLinkFormularioDto.fechaInicio,
          fechaFin: createLinkFormularioDto.fechaFin,
          costo: createLinkFormularioDto.costo,
        },
      });

      // Generar token final con el ID real del link
      const payload = {
        id: link.id,
        rol: Role.REGISTRO_FORMULARIO,
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });

      // Actualizar con token final
      const updatedLink = await tx.linkFormulario.update({
        where: { id: link.id },
        data: {
          url: `${ruta}${token}`,
        },
      });

      return updatedLink.url;
    });
  }

  /**
   * Obtiene todos los links de formulario con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de links y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    let totalLinks = await this.prisma.linkFormulario.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalLinks / limit);

    if (totalLinks === undefined) totalLinks = 0;

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalLinks,
      lastPage,
    );

    if (totalLinks === 0 || page > emptyData.meta.lastPage) return emptyData;

    const links = await this.prisma.linkFormulario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
    });

    return { data: links, meta: { page, limit, totalLinks, lastPage } };
  }

  /**
   * Obtiene un link por su ID.
   * @param id ID del link.
   * @returns El link encontrado.
   * @throws NotFoundException si el link no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.linkFormulario.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina un link por su ID
   * @param id ID del link
   * @returns Link eliminado
   * @throws BadRequestException si el link no existe
   */
  async remove(id: number) {
    try {
      const link = await this.prisma.linkFormulario.update({
        where: { id },
        data: { deleted: true },
      });

      const { url } = link;

      const token = url.split('/').pop();

      this.blacklistService.addToBlacklist(token);

      return link;
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  async removeTx(id: number, tx: Prisma.TransactionClient) {
    try {
      const link = await tx.linkFormulario.update({
        where: { id },
        data: { deleted: true },
      });

      const { url } = link;

      const token = url.split('/').pop();

      this.blacklistService.addToBlacklist(token);

      return link;
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un linkFormulario con su id en su complecion o expiracion
   * @param id
   * @param updateLinkFormularioDto
   */
  async update(id: number, updateLinkFormularioDto: UpdateLinkFormularioDto) {
    try {
      return await this.prisma.linkFormulario.update({
        where: { id },
        data: updateLinkFormularioDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  async UpdateTransaction(
    data: UpdateLinkFormularioDto,
    tx: Prisma.TransactionClient,
    id: number,
  ) {
    try {
      return await tx.linkFormulario.update({
        where: { id },
        data: data,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Regenera un link temporal para el formulario de reserva, el cual contiene un jwt valido
   * @param id ID del link
   * @throws NotFoundException si el link no existe
   * @throws BadRequestException si el link ya ha sido completado
   * @returns Link temporal
   */
  async regenerateLink(id: number) {
    const ruta = `${FRONTEND_URL}/registro-formulario/`;
    const hoy = new Date(new Date().toISOString());

    // Obtener link para validar y extraer token viejo
    let linkExistente;
    try {
      linkExistente = await this.findOne(id);
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }

    if (linkExistente.completado) {
      throw new BadRequestException('El link ya ha sido completado');
    }

    // Extraer token viejo para blacklist
    const { url } = linkExistente;
    const oldToken = url.split('/').pop();
    this.blacklistService.addToBlacklist(oldToken);

    // Generar nuevo token
    const payload = {
      id: linkExistente.id,
      rol: Role.REGISTRO_FORMULARIO,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    const vencimiento = new Date(hoy.getTime() + 3600 * 1000);

    // Actualización atómica con condición
    const updatedLink = await this.prisma.linkFormulario.updateMany({
      where: {
        id,
        completado: false, // Condición atómica para prevenir regeneración de links completados
      },
      data: {
        url: `${ruta}${token}`,
        vencimiento: vencimiento,
        expirado: false,
      },
    });

    if (updatedLink.count === 0) {
      throw new BadRequestException(
        'El link ya ha sido completado o no existe',
      );
    }

    // Retornar link actualizado
    return await this.findOne(id);
  }

  /**
   * Retorna el payload del token
   * @param token Token a validar
   * @returns Payload del token
   */
  async validateToken(token: string) {
    // The LinkFormularioGuard already does the complete validation,
    // so we just return the payload here
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Obtiene todos los links de formulario de una habitación específica con paginación.
   * @param numeroHabitacion Número de la habitación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de links y metadatos de paginación.
   */
  async findAllByHabitacion(
    numeroHabitacion: number,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;

    const totalLinks = await this.prisma.linkFormulario.count({
      where: {
        numeroHabitacion,
        deleted: false,
      },
    });

    const lastPage = Math.ceil(totalLinks / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalLinks,
      lastPage,
    );

    if (totalLinks === 0 || page > emptyData.meta.lastPage) return emptyData;

    const links = await this.prisma.linkFormulario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        numeroHabitacion,
        deleted: false,
      },
    });

    return { data: links, meta: { page, limit, totalLinks, lastPage } };
  }
}
