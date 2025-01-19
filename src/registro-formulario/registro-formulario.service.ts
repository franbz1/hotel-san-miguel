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
import { CreateReservaDto } from 'src/reservas/dto/create-reserva.dto';
import { Huesped } from '@prisma/client';
import { CreateFacturaDto } from 'src/facturas/dto/create-factura.dto';
import { TraService } from 'src/TRA/tra.service';

@Injectable()
export class RegistroFormularioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly traService: TraService,
  ) {}

  async create(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    tokenId: number,
  ) {
    const huespedDto = this.createHuespedDto(createRegistroFormularioDto);

    const huesped = await this.findOrCreateHuesped(huespedDto);

    const reserva = this.createReservaDto(
      createRegistroFormularioDto,
      huesped.id,
    );

    const factura = this.createFacturaDto(
      createRegistroFormularioDto,
      huesped.id,
    );

    const { huespedes_secundarios } = createRegistroFormularioDto;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const facturaCreated = await tx.factura.create({
          data: factura,
        });

        const reservaCreated = await tx.reserva.create({
          data: { ...reserva, facturaId: facturaCreated.id },
        });

        const formulario = await tx.formulario.create({
          data: {
            huespedId: huesped.id,
            reservaId: reservaCreated.id,
          },
        });

        const linkFormulario = await tx.linkFormulario.update({
          where: { id: tokenId },
          data: {
            completado: true,
            formularioId: formulario.id,
          },
        });

        if (huespedes_secundarios?.length) {
          const huespedesSecundariosConHuespedId = huespedes_secundarios.map(
            (huespedSecundario) => ({
              ...huespedSecundario,
              huespedId: huesped.id,
            }),
          );

          await tx.huespedSecundario.createManyAndReturn({
            data: huespedesSecundariosConHuespedId,
            skipDuplicates: true,
          });
        }

        return {
          success: true,
          huesped,
          facturaCreated,
          reservaCreated,
          formulario,
          linkFormulario,
        };
      });

      const responseTra = await this.traService.postTraHuespedPrincipalFromForm(
        createRegistroFormularioDto,
      );

      console.log(responseTra);

      return result;
    } catch (error) {
      this.handleDatabaseError(error);
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

  /**
   * Extrae los datos del huesped del formularioDto
   * @param dto datos del formulario
   * @returns dto huesped
   */
  private createHuespedDto(dto: CreateRegistroFormularioDto): CreateHuespedDto {
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
    } = dto;

    return {
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
  }

  /**
   * Extrae los datos de la reserva del formulario y añade el id del huesped
   * @param dto datos del formulario
   * @param id id del huesped
   * @returns dto de la reserva
   */
  private createReservaDto(
    dto: CreateRegistroFormularioDto,
    id: number,
  ): CreateReservaDto {
    const {
      fecha_inicio,
      fecha_fin,
      pais_residencia,
      departamento_residencia,
      ciudad_residencia,
      motivo_viaje,
      costo,
      habitacionId,
      numero_acompaniantes,
    } = dto;

    return {
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
      huespedId: id,
    };
  }

  /**
   * Busca y devuelve el huesped de la base de datos, si no lo encuentra lo crea
   * @param dto Dto del huesped a crear
   * @returns El huesped creado
   */
  private async findOrCreateHuesped(dto: CreateHuespedDto): Promise<Huesped> {
    const huesped = await this.prisma.huesped.findFirst({
      where: { numero_documento: dto.numero_documento, deleted: false },
    });

    if (!huesped) {
      return await this.prisma.huesped.create({
        data: dto,
      });
    }

    return huesped;
  }

  /**
   * Extrae los datos de la factura del formulario y añade el id del huesped
   * @param dto datos del formulario
   * @param huespedId id del huesped
   * @returns dto de la factura
   */
  private createFacturaDto(
    dto: CreateRegistroFormularioDto,
    huespedId: number,
  ): CreateFacturaDto {
    const { costo } = dto;

    return {
      total: costo,
      huespedId: huespedId,
      fecha_factura: new Date(),
    };
  }

  /**
   * Busca error de habitación no existente
   * @param error error de la base de datos
   * @returns nunca
   */
  private handleDatabaseError(error: any): never {
    if (error.code === 'P2003') {
      throw new BadRequestException('La habitación no existe');
    }
    throw error;
  }
}
