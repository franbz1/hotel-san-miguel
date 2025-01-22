import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DOMAIN_URL } from 'src/common/constants/domain';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Role } from 'src/usuarios/entities/rol.enum';
import { UpdateLinkFormularioDto } from './dto/UpdateLinkFormularioDto';
import notFoundError from 'src/common/errors/notfoundError';
import { Prisma } from '@prisma/client';

@Injectable()
export class LinkFormularioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Crea un link temporal para el formulario de reserva, el cual contiene un jwt valido
   * @returns Link temporal
   */
  async createLinkTemporal() {
    const ruta = `${DOMAIN_URL}/registro-formulario/`;

    const vencimiento = new Date(Date.now() + 3600 * 1000);

    const link = await this.prisma.linkFormulario.create({
      data: {
        url: '',
        vencimiento: vencimiento,
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
   * Busca un link temporal para el formulario de reserva por su ID
   * @param id ID del link
   * @returns Link temporal
   * @throws BadRequestException si el link no existe
   */
  async findOne(id: number) {
    try {
      const link = await this.prisma.linkFormulario.findFirst({
        where: { id },
      });

      if (!link) throw new BadRequestException('Link no encontrado');

      return link;
    } catch (error) {
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
}
