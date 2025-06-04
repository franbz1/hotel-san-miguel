import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { FiltrosReservaDto } from './dto/filtros-reserva.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import notFoundError from 'src/common/errors/notfoundError';
import { Prisma } from '@prisma/client';
import { UpdateReservaWithHuespedesSecundariosDto } from './dto/updateReservaWithHuespedesSecundariosDto';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva reserva
   * @param createReservaDto Datos para crear la reserva
   * @returns La reserva creada
   * @throws BadRequestException si no se proporcionan datos para crear la reserva
   */
  async create(createReservaDto: CreateReservaDto) {
    try {
      return await this.prisma.reserva.create({
        data: createReservaDto,
      });
    } catch (error) {
      if (error.code === 'P2003')
        throw new BadRequestException(
          'El huesped no existe o no se encontró la habitación',
        );
      throw error;
    }
  }

  async createTransaction(
    createReservaDto: CreateReservaDto,
    facturaId: number,
    tx: Prisma.TransactionClient,
  ) {
    try {
      return await tx.reserva.create({
        data: {
          ...createReservaDto,
          facturaId,
        },
      });
    } catch (error) {
      if (error.code === 'P2003')
        throw new BadRequestException(
          'El huesped no existe o no se encontró la habitación',
        );
      throw error;
    }
  }

  /**
   * Obtiene todas las reservas con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Objeto con la lista de reservas y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalReservas = await this.prisma.reserva.count({
      where: { deleted: false },
    });

    const lastPage = Math.ceil(totalReservas / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalReservas,
      lastPage,
    );

    if (totalReservas === 0 || page > emptyData.meta.lastPage) return emptyData;

    const reservas = await this.prisma.reserva.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: false },
      include: {
        factura: {
          where: { deleted: false },
        },
        huespedes_secundarios: {
          where: { deleted: false },
        },
        huesped: true,
      },
    });

    return { data: reservas, meta: { page, limit, totalReservas, lastPage } };
  }

  /**
   * Busca una reserva por su ID.
   * @param id ID de la reserva.
   * @returns La reserva encontrada.
   * @throws NotFoundException si la reserva no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.reserva.findFirstOrThrow({
        where: { id, deleted: false },
        include: {
          factura: {
            where: { deleted: false },
          },
          huespedes_secundarios: {
            where: { deleted: false },
          },
          huesped: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Actualiza los datos de una reserva por su ID.
   * @param id ID de la reserva.
   * @param updateReservaDto Datos para actualizar.
   * @returns La reserva actualizada.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si la reserva no existe.
   */
  async update(id: number, updateReservaDto: UpdateReservaDto) {
    if (!Object.keys(updateReservaDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar la reserva.',
      );
    }

    try {
      return await this.prisma.reserva.update({
        where: { id, deleted: false },
        data: updateReservaDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  async UpdateTransaction(
    updateReservaDto: UpdateReservaWithHuespedesSecundariosDto,
    tx: Prisma.TransactionClient,
    id: number,
  ) {
    const { huespedes_secundarios, ...rest } = updateReservaDto;
    try {
      return await tx.reserva.update({
        where: { id: id },
        data: {
          ...rest,
          huespedes_secundarios: {
            connect: huespedes_secundarios,
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Elimina una reserva por su ID con eliminación en cascada.
   * Elimina:
   * - La reserva (soft delete)
   * - Todos los formularios relacionados
   * - Todos los LinkFormulario relacionados con esos formularios
   * - La factura asociada (si existe)
   * - Los huéspedes secundarios (solo si no tienen otras reservas activas)
   * - El huésped principal (solo si no tiene otras reservas activas)
   * @param id ID de la reserva.
   * @returns La reserva eliminada.
   * @throws NotFoundException si la reserva no existe.
   */
  async remove(id: number) {
    return await this.prisma.$transaction(async (tx) => {
      // Primero obtener la reserva con todas sus relaciones
      const reserva = await tx.reserva.findFirst({
        where: { id, deleted: false },
        include: {
          Formulario: {
            where: { deleted: false },
            include: {
              LinkFormulario: {
                where: { deleted: false },
              },
            },
          },
          factura: {
            where: { deleted: false },
          },
          huespedes_secundarios: {
            where: { deleted: false },
          },
          huesped: true,
        },
      });

      if (!reserva) {
        throw notFoundError(id);
      }

      // 1. Eliminar la reserva (soft delete)
      const reservaEliminada = await tx.reserva.update({
        where: { id },
        data: { deleted: true },
      });

      // 2. Eliminar LinkFormulario relacionados con los formularios de esta reserva
      for (const formulario of reserva.Formulario) {
        if (formulario.LinkFormulario) {
          await tx.linkFormulario.update({
            where: { id: formulario.LinkFormulario.id },
            data: { deleted: true },
          });
        }
      }

      // 3. Eliminar formularios relacionados con esta reserva
      await tx.formulario.updateMany({
        where: {
          reservaId: id,
          deleted: false,
        },
        data: { deleted: true },
      });

      // 4. Eliminar factura si existe
      if (reserva.factura) {
        await tx.factura.update({
          where: { id: reserva.factura.id },
          data: { deleted: true },
        });
      }

      // 5. Verificar y eliminar huéspedes secundarios si no tienen otras reservas activas
      for (const huespedSecundario of reserva.huespedes_secundarios) {
        const otrasReservasSecundario = await tx.reserva.count({
          where: {
            id: { not: id },
            deleted: false,
            huespedes_secundarios: {
              some: { id: huespedSecundario.id },
            },
          },
        });

        if (otrasReservasSecundario === 0) {
          await tx.huespedSecundario.update({
            where: { id: huespedSecundario.id },
            data: { deleted: true },
          });
        }
      }

      // 6. Verificar y eliminar huésped principal si no tiene otras reservas activas
      const otrasReservasHuesped = await tx.reserva.count({
        where: {
          id: { not: id },
          huespedId: reserva.huespedId,
          deleted: false,
        },
      });

      if (otrasReservasHuesped === 0) {
        await tx.huesped.update({
          where: { id: reserva.huespedId },
          data: { deleted: true },
        });
      }

      return reservaEliminada;
    });
  }

  async removeTx(id: number, tx: Prisma.TransactionClient) {
    try {
      return await tx.reserva.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Busca reservas aplicando filtros múltiples usando el patrón Query Builder
   * @param filtros Filtros a aplicar en la búsqueda
   * @returns Reservas filtradas con paginación
   */
  async buscarConFiltros(filtros: FiltrosReservaDto) {
    const { page, limit, ...filtrosBusqueda } = filtros;

    // Construir WHERE clause usando Query Builder
    const whereClause = this.construirWhereClause(filtrosBusqueda);

    // Construir ORDER BY clause
    const orderBy = this.construirOrderBy(
      filtros.ordenarPor,
      filtros.direccionOrden,
    );

    // Contar total de registros que coinciden con los filtros
    const totalReservas = await this.prisma.reserva.count({
      where: whereClause,
    });

    const lastPage = Math.ceil(totalReservas / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalReservas,
      lastPage,
    );

    if (totalReservas === 0 || page > emptyData.meta.lastPage) return emptyData;

    // Buscar reservas con filtros aplicados
    const reservas = await this.prisma.reserva.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
      orderBy,
      include: {
        factura: {
          where: { deleted: false },
        },
        huespedes_secundarios: {
          where: { deleted: false },
        },
        huesped: {
          select: {
            id: true,
            nombres: true,
            primer_apellido: true,
            segundo_apellido: true,
            numero_documento: true,
            tipo_documento: true,
            nacionalidad: true,
            telefono: true,
            correo: true,
          },
        },
        habitacion: {
          select: {
            id: true,
            numero_habitacion: true,
            tipo: true,
            precio_por_noche: true,
          },
        },
      },
    });

    return {
      data: reservas,
      meta: {
        page,
        limit,
        totalReservas,
        lastPage,
        filtrosAplicados: this.obtenerFiltrosAplicados(filtrosBusqueda),
      },
    };
  }

  /**
   * Patrón Query Builder: Construye la cláusula WHERE de manera dinámica
   * @param filtros Filtros a aplicar
   * @returns Objeto WHERE de Prisma
   */
  private construirWhereClause(
    filtros: Omit<
      FiltrosReservaDto,
      'page' | 'limit' | 'ordenarPor' | 'direccionOrden'
    >,
  ): Prisma.ReservaWhereInput {
    const where: Prisma.ReservaWhereInput = {
      deleted: false,
    };

    // Filtros de fecha de inicio
    if (filtros.fechaInicioDesde || filtros.fechaInicioHasta) {
      where.fecha_inicio = {};
      if (filtros.fechaInicioDesde) {
        where.fecha_inicio.gte = new Date(filtros.fechaInicioDesde);
      }
      if (filtros.fechaInicioHasta) {
        where.fecha_inicio.lte = new Date(filtros.fechaInicioHasta);
      }
    }

    // Filtros de check-in
    if (filtros.checkInDesde || filtros.checkInHasta) {
      where.check_in = {};
      if (filtros.checkInDesde) {
        where.check_in.gte = new Date(filtros.checkInDesde);
      }
      if (filtros.checkInHasta) {
        where.check_in.lte = new Date(filtros.checkInHasta);
      }
    }

    // Filtro por estado
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Filtros geográficos
    if (filtros.paisProcedencia) {
      where.pais_procedencia = {
        contains: filtros.paisProcedencia,
        mode: 'insensitive',
      };
    }

    if (filtros.ciudadProcedencia) {
      where.ciudad_procedencia = {
        contains: filtros.ciudadProcedencia,
        mode: 'insensitive',
      };
    }

    // Filtro por motivo de viaje
    if (filtros.motivoViaje) {
      where.motivo_viaje = filtros.motivoViaje;
    }

    // Filtros de IDs
    if (filtros.habitacionId) {
      where.habitacionId = filtros.habitacionId;
    }

    if (filtros.huespedId) {
      where.huespedId = filtros.huespedId;
    }

    // Filtros de costo
    if (
      filtros.costoMinimo !== undefined ||
      filtros.costoMaximo !== undefined
    ) {
      where.costo = {};
      if (filtros.costoMinimo !== undefined) {
        where.costo.gte = filtros.costoMinimo;
      }
      if (filtros.costoMaximo !== undefined) {
        where.costo.lte = filtros.costoMaximo;
      }
    }

    // Filtros de acompañantes
    if (
      filtros.acompaniantesMinimo !== undefined ||
      filtros.acompaniantesMaximo !== undefined
    ) {
      where.numero_acompaniantes = {};
      if (filtros.acompaniantesMinimo !== undefined) {
        where.numero_acompaniantes.gte = filtros.acompaniantesMinimo;
      }
      if (filtros.acompaniantesMaximo !== undefined) {
        where.numero_acompaniantes.lte = filtros.acompaniantesMaximo;
      }
    }

    // Búsqueda de texto libre en datos del huésped
    if (filtros.busquedaTexto) {
      where.huesped = {
        OR: [
          {
            nombres: {
              contains: filtros.busquedaTexto,
              mode: 'insensitive',
            },
          },
          {
            primer_apellido: {
              contains: filtros.busquedaTexto,
              mode: 'insensitive',
            },
          },
          {
            segundo_apellido: {
              contains: filtros.busquedaTexto,
              mode: 'insensitive',
            },
          },
          {
            numero_documento: {
              contains: filtros.busquedaTexto,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    return where;
  }

  /**
   * Patrón Query Builder: Construye la cláusula ORDER BY
   * @param ordenarPor Campo por el que ordenar
   * @param direccion Dirección del ordenamiento
   * @returns Objeto ORDER BY de Prisma
   */
  private construirOrderBy(
    ordenarPor?: string,
    direccion: 'asc' | 'desc' = 'desc',
  ): Prisma.ReservaOrderByWithRelationInput {
    const orderBy: Prisma.ReservaOrderByWithRelationInput = {};

    switch (ordenarPor) {
      case 'fecha_inicio':
        orderBy.fecha_inicio = direccion;
        break;
      case 'fecha_fin':
        orderBy.fecha_fin = direccion;
        break;
      case 'check_in':
        orderBy.check_in = direccion;
        break;
      case 'check_out':
        orderBy.check_out = direccion;
        break;
      case 'costo':
        orderBy.costo = direccion;
        break;
      case 'createdAt':
        orderBy.createdAt = direccion;
        break;
      default:
        // Por defecto ordenar por fecha de creación descendente
        orderBy.createdAt = 'desc';
    }

    return orderBy;
  }

  /**
   * Obtiene un resumen de los filtros aplicados para incluir en la respuesta
   * @param filtros Filtros aplicados
   * @returns Resumen de filtros
   */
  private obtenerFiltrosAplicados(
    filtros: Omit<
      FiltrosReservaDto,
      'page' | 'limit' | 'ordenarPor' | 'direccionOrden'
    >,
  ) {
    const filtrosAplicados: any = {};
    let contador = 0;

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filtrosAplicados[key] = value;
        contador++;
      }
    });

    return {
      total: contador,
      filtros: filtrosAplicados,
    };
  }
}
