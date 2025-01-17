import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRegistroFormularioDto } from './dto/createRegistroFormularioDto';
import { CreateHuespedDto } from 'src/huespedes/dto/create-huesped.dto';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { DOMAIN_URL } from 'src/common/constants/domain';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/usuarios/entities/rol.enum';
import { UpdateLinkFormularioDto } from './dto/UpdateLinkFormularioDto';
import notFoundError from 'src/common/errors/notfoundError';

@Injectable()
export class RegistroFormularioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createRegistroFormularioDto: CreateRegistroFormularioDto) {
    const {
      tipo_documento,
      numero_documento,
      primer_apellido,
      segundo_apellido,
      nombres,
      pais_residencia,
      departamento_residencia,
      ciudad_residencia,
      fecha_nacimiento,
      nacionalidad,
      ocupacion,
      genero,
      telefono,
      correo,
      fecha_inicio,
      fecha_fin,
      motivo_viaje,
      costo,
      habitacionId,
      numero_acompaniantes,
    } = createRegistroFormularioDto;

    const huesped: CreateHuespedDto = {
      tipo_documento,
      numero_documento,
      primer_apellido,
      segundo_apellido,
      nombres,
      pais_residencia,
      departamento_residencia,
      ciudad_residencia,
      fecha_nacimiento,
      nacionalidad,
      ocupacion,
      genero,
      telefono,
      correo,
      lugar_nacimiento: nacionalidad,
    };

    const reserva = {
      fecha_inicio,
      fecha_fin,
      estado: EstadosReserva.RESERVADO,
      pais_procedencia: pais_residencia,
      departamento_procedencia: departamento_residencia,
      ciudad_procedencia: ciudad_residencia,
      pais_destino: pais_residencia,
      motivo_viaje,
      check_in: fecha_inicio,
      check_out: fecha_fin,
      costo,
      numero_acompaniantes,
      habitacionId,
    };

    try {
      const existingHuesped = await this.prisma.huesped.findUnique({
        where: { numero_documento },
      });

      let huespedId: number;

      if (existingHuesped) {
        huespedId = existingHuesped.id;
      } else {
        const newHuesped = await this.prisma.huesped.create({
          data: huesped,
        });
        huespedId = newHuesped.id;
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const facturaCreated = await tx.factura.create({
          data: {
            total: costo,
            fecha_factura: new Date(),
            huespedId,
          },
        });

        const reservaCreated = await tx.reserva.create({
          data: {
            ...reserva,
            huespedId,
            facturaId: facturaCreated.id,
          },
        });

        return {
          success: true,
          huespedId,
          facturaCreated,
          reservaCreated,
        };
      });

      return result;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('La habitación no existe');
      }
      console.error(error);
      throw error;
    }
  }

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
      const link = await this.prisma.linkFormulario.findFirstOrThrow({
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
}
