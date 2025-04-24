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

    const vencimiento = new Date(Date.now() + 3600 * 1000);

    let habitacion;

    try {
      habitacion = await this.prisma.habitacion.findFirstOrThrow({
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

    const link = await this.prisma.linkFormulario.create({
      data: {
        url: '',
        vencimiento: vencimiento,
        numeroHabitacion: habitacion.numero_habitacion,
        fechaInicio: createLinkFormularioDto.fechaInicio,
        fechaFin: createLinkFormularioDto.fechaFin,
        costo: createLinkFormularioDto.costo,
      },
    });

    const payload = {
      id: link.id,
      rol: Role.REGISTRO_FORMULARIO,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    const updatedLink = await this.prisma.linkFormulario.update({
      where: { id: link.id },
      data: {
        url: `${ruta}${token}`,
      },
    });

    return updatedLink.url;
  }

  /**
   * Obtiene todos los links de formulario con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de links y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalLinks = await this.prisma.linkFormulario.count({
      where: { deleted: false },
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

    try {
      const link = await this.findOne(id);

      if (link.completado) {
        throw new BadRequestException('El link ya ha sido completado');
      }

      const { url } = link;

      const oldToken = url.split('/').pop();

      this.blacklistService.addToBlacklist(oldToken);

      const payload = {
        id: link.id,
        rol: Role.REGISTRO_FORMULARIO,
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });

      const updatedLink = await this.prisma.linkFormulario.update({
        where: { id },
        data: {
          url: `${ruta}${token}`,
          vencimiento: new Date(Date.now() + 3600 * 1000),
          expirado: false,
        },
      });

      return updatedLink;
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Valida un token
   * @param token Token a validar
   * @returns Payload del token
   * @throws UnauthorizedException si el token no es válido o expirado
   */
  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      const blacklisted = await this.blacklistService.isTokenBlacklisted(token);

      if (blacklisted) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
