import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRegistroAseoZonaComunDto } from './dto/create-registro-aseo-zonas-comune.dto';
import { UpdateRegistroAseoZonaComunDto } from './dto/update-registro-aseo-zonas-comune.dto';
import { FiltrosRegistroAseoZonaComunDto } from './dto/filtros-registro-aseo-zona-comun.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import notFoundError from 'src/common/errors/notfoundError';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';
import { TiposAseo } from 'src/common/enums/tipos-aseo.enum';
import { ConfiguracionAseo, Prisma } from '@prisma/client';
import { ConfiguracionAseoService } from 'src/configuracion-aseo/configuracion-aseo.service';

/**
 * Service CRUD para manejar registros de aseo de zonas comunes
 */
@Injectable()
export class RegistroAseoZonasComunesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configuracionAseoService: ConfiguracionAseoService,
  ) {}

  /**
   * Crea un nuevo registro de aseo de zona común.
   * @param createRegistroAseoZonaComunDto Datos del registro a crear.
   * @returns El registro creado.
   */
  async create(createRegistroAseoZonaComunDto: CreateRegistroAseoZonaComunDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const registro = await tx.registroAseoZonaComun.create({
          data: createRegistroAseoZonaComunDto,
          select: this.defaultRegistroSelection(),
        });

        await this.actualizarEstadosAseoZonasComunes(
          createRegistroAseoZonaComunDto.tipos_realizados,
          tx,
          createRegistroAseoZonaComunDto.zonaComunId,
          new Date(createRegistroAseoZonaComunDto.fecha_registro),
        );
        return registro;
      });
    } catch (error) {
      console.error('Error al crear registro de aseo de zona común:', error);
      throw new BadRequestException(
        'Error al crear registro de aseo de zona común',
      );
    }
  }

  /**
   * Obtiene todos los registros con paginación y filtros.
   * @param paginationDto Datos de paginación.
   * @param filtrosDto Filtros de búsqueda.
   * @returns Objeto con la lista de registros y metadatos de paginación.
   */
  async findAll(
    paginationDto: PaginationDto,
    filtrosDto?: FiltrosRegistroAseoZonaComunDto,
  ) {
    const { page, limit } = paginationDto;

    // Construir filtros where
    const whereClause: any = { deleted: false };

    if (filtrosDto?.usuarioId) {
      whereClause.usuarioId = filtrosDto.usuarioId;
    }

    if (filtrosDto?.zonaComunId) {
      whereClause.zonaComunId = filtrosDto.zonaComunId;
    }

    if (filtrosDto?.fecha) {
      const fechaInicio = new Date(filtrosDto.fecha);
      const fechaFin = new Date(filtrosDto.fecha);
      fechaFin.setDate(fechaFin.getDate() + 1);

      whereClause.fecha_registro = {
        gte: fechaInicio,
        lt: fechaFin,
      };
    }

    if (filtrosDto?.tipo_aseo) {
      whereClause.tipos_realizados = {
        has: filtrosDto.tipo_aseo,
      };
    }

    if (filtrosDto?.objetos_perdidos !== undefined) {
      whereClause.objetos_perdidos = filtrosDto.objetos_perdidos;
    }

    if (filtrosDto?.rastros_de_animales !== undefined) {
      whereClause.rastros_de_animales = filtrosDto.rastros_de_animales;
    }

    const totalRegistros = await this.prisma.registroAseoZonaComun.count({
      where: whereClause,
    });

    const lastPage = Math.ceil(totalRegistros / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalRegistros,
      lastPage,
    );

    if (totalRegistros === 0 || page > emptyData.meta.lastPage)
      return emptyData;

    const registros = await this.prisma.registroAseoZonaComun.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
      select: this.defaultRegistroSelection(),
      orderBy: { fecha_registro: 'desc' },
    });

    return {
      data: registros,
      meta: { page, limit, total: totalRegistros, lastPage },
    };
  }

  /**
   * Busca un registro por su ID.
   * @param id ID del registro.
   * @returns El registro encontrado.
   * @throws NotFoundException si el registro no existe.
   */
  async findOne(id: number) {
    const registro = await this.prisma.registroAseoZonaComun.findFirst({
      where: { id, deleted: false },
      select: this.defaultRegistroSelection(),
    });

    if (!registro) throw notFoundError(id);

    return registro;
  }

  /**
   * Actualiza los datos de un registro por su ID.
   * @param id ID del registro.
   * @param updateRegistroAseoZonaComunDto Datos para actualizar.
   * @returns El registro actualizado.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si el registro no existe.
   */
  async update(
    id: number,
    updateRegistroAseoZonaComunDto: UpdateRegistroAseoZonaComunDto,
  ) {
    if (!Object.keys(updateRegistroAseoZonaComunDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar el registro de aseo',
      );
    }

    // Preparar los datos para actualizar
    const dataToUpdate: any = { ...updateRegistroAseoZonaComunDto };

    // Convertir fecha si está presente
    if (updateRegistroAseoZonaComunDto.fecha_registro) {
      dataToUpdate.fecha_registro = new Date(
        updateRegistroAseoZonaComunDto.fecha_registro,
      );
    }

    try {
      return await this.prisma.registroAseoZonaComun.update({
        where: { id, deleted: false },
        data: dataToUpdate,
        select: this.defaultRegistroSelection(),
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);

      throw error;
    }
  }

  /**
   * Elimina (soft delete) un registro por su ID.
   * @param id ID del registro.
   * @returns El registro eliminado.
   * @throws NotFoundException si el registro no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.registroAseoZonaComun.update({
        where: { id, deleted: false },
        data: { deleted: true },
        select: this.defaultRegistroSelection(),
      });
    } catch (error) {
      if (error.code === 'P2025') throw notFoundError(id);
      throw error;
    }
  }

  /**
   * Busca registros por ID de zona común.
   * @param zonaComunId ID de la zona común.
   * @returns Lista de registros de la zona común.
   */
  async findByZonaComun(zonaComunId: number) {
    return await this.prisma.registroAseoZonaComun.findMany({
      where: {
        zonaComunId,
        deleted: false,
      },
      select: this.defaultRegistroSelection(),
      orderBy: { fecha_registro: 'desc' },
    });
  }

  /**
   * Busca registros por ID de usuario.
   * @param usuarioId ID del usuario.
   * @returns Lista de registros del usuario.
   */
  async findByUsuario(usuarioId: number) {
    return await this.prisma.registroAseoZonaComun.findMany({
      where: {
        usuarioId,
        deleted: false,
      },
      select: this.defaultRegistroSelection(),
      orderBy: { fecha_registro: 'desc' },
    });
  }

  /**
   * Busca registros por fecha específica.
   * @param fecha Fecha en formato string (YYYY-MM-DD).
   * @returns Lista de registros de la fecha.
   */
  async findByFecha(fecha: string) {
    const fechaInicio = new Date(fecha);
    const fechaFin = new Date(fecha);
    fechaFin.setDate(fechaFin.getDate() + 1);

    return await this.prisma.registroAseoZonaComun.findMany({
      where: {
        fecha_registro: {
          gte: fechaInicio,
          lt: fechaFin,
        },
        deleted: false,
      },
      select: this.defaultRegistroSelection(),
      orderBy: { fecha_registro: 'desc' },
    });
  }

  /**
   * Selección predeterminada para los campos del registro.
   * @returns Objeto de selección para Prisma.
   */
  private defaultRegistroSelection() {
    return {
      id: true,
      usuarioId: true,
      zonaComunId: true,
      fecha_registro: true,
      tipos_realizados: true,
      objetos_perdidos: true,
      rastros_de_animales: true,
      observaciones: true,
      createdAt: true,
      updatedAt: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
        },
      },
      zonaComun: {
        select: {
          id: true,
          nombre: true,
        },
      },
    };
  }

  /**
   * Actualiza los estados de cuando se realizo el ultimo aseo de una zona común y si es hoy se requiere aseo cuando se crea un nuevo reporte de aseo
   * mediante una transaccion
   * @param tipoAseo Tipo de aseo realizado
   * @param tx Transaccion de prisma
   * @param idZonaComun ID de la zona común
   * @param fechaRegistro Fecha del registro de aseo
   */
  private async actualizarEstadosAseoZonasComunes(
    tipoAseo: TiposAseo[],
    tx: Prisma.TransactionClient,
    idZonaComun: number,
    fechaRegistro: Date,
  ) {
    const zonaComun = await tx.zonaComun.findUnique({
      where: {
        id: idZonaComun,
        deleted: false,
      },
    });

    if (!zonaComun) throw notFoundError(idZonaComun);

    // Determinar el tipo de aseo más relevante basado en prioridades
    const tipoAseoMasRelevante = this.determinarTipoAseoMasRelevante(tipoAseo);

    // Preparar datos de actualización
    const dataToUpdate: Prisma.ZonaComunUpdateInput = {
      ultimo_aseo_fecha: fechaRegistro,
      ultimo_aseo_tipo: tipoAseoMasRelevante,
      requerido_aseo_hoy: false,
    };

    // Si se realizó desinfección, calcular próxima fecha
    if (tipoAseo.includes(TiposAseo.DESINFECCION)) {
      const configuracion = await this.obtenerConfiguracionAseo();
      const proximaDesinfeccion = new Date(fechaRegistro);
      proximaDesinfeccion.setDate(
        proximaDesinfeccion.getDate() +
          configuracion.frecuencia_desinfeccion_zona_comun,
      );

      dataToUpdate.proxima_desinfeccion_zona_comun = proximaDesinfeccion;
      dataToUpdate.requerido_desinfeccion_hoy = false;
    }

    await tx.zonaComun.update({
      where: {
        id: idZonaComun,
        deleted: false,
      },
      data: dataToUpdate,
    });
  }

  /**
   * Determina el tipo de aseo más relevante basado en prioridades de importancia
   * @param tipos Array de tipos de aseo realizados
   * @returns El tipo de aseo más relevante
   */
  private determinarTipoAseoMasRelevante(tipos: TiposAseo[]): TiposAseo {
    // Definir prioridades (mayor número = mayor prioridad)
    const prioridades = {
      [TiposAseo.DESINFECCION]: 2,
      [TiposAseo.LIMPIEZA]: 1,
    };

    return tipos.reduce((tipoMasRelevante, tipoActual) => {
      return prioridades[tipoActual] > prioridades[tipoMasRelevante]
        ? tipoActual
        : tipoMasRelevante;
    });
  }

  /**
   * Obtiene la configuración de aseo
   * @returns La configuración de aseo
   */
  private async obtenerConfiguracionAseo(): Promise<ConfiguracionAseo> {
    const configuracion =
      await this.configuracionAseoService.obtenerConfiguracion();
    return configuracion;
  }
}
