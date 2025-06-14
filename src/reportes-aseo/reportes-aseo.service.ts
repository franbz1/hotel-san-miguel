import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportesAseoDto } from './dto/create-reportes-aseo.dto';
import { UpdateReportesAseoDto } from './dto/update-reportes-aseo.dto';
import { FiltrosReportesAseoDto } from './dto/filtros-reportes-aseo.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';

/**
 * Service CRUD para manejar reportes de aseo diarios
 */
@Injectable()
export class ReportesAseoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo reporte de aseo diario.
   * @param createReportesAseoDto Datos del reporte a crear.
   * @returns El reporte creado.
   * @throws BadRequestException si ya existe un reporte para la fecha.
   */
  async create(createReportesAseoDto: CreateReportesAseoDto) {
    try {
      return await this.prisma.reporteAseoDiario.create({
        data: {
          fecha: new Date(createReportesAseoDto.fecha),
          elementos_aseo: createReportesAseoDto.elementos_aseo,
          elementos_proteccion: createReportesAseoDto.elementos_proteccion,
          productos_quimicos: createReportesAseoDto.productos_quimicos,
          procedimiento_aseo_habitacion:
            createReportesAseoDto.procedimiento_aseo_habitacion,
          procedimiento_desinfeccion_habitacion:
            createReportesAseoDto.procedimiento_desinfeccion_habitacion,
          procedimiento_limpieza_zona_comun:
            createReportesAseoDto.procedimiento_limpieza_zona_comun,
          procedimiento_desinfeccion_zona_comun:
            createReportesAseoDto.procedimiento_desinfeccion_zona_comun,
          datos: createReportesAseoDto.datos,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un reporte de aseo para esta fecha',
        );
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los reportes de aseo con paginación y filtros.
   * @param filtrosDto Datos de paginación y filtros.
   * @returns Objeto con la lista de reportes y metadatos de paginación.
   */
  async findAll(filtrosDto: FiltrosReportesAseoDto) {
    const {
      page,
      limit,
      fecha,
      fecha_inicio,
      fecha_fin,
      elemento_aseo,
      producto_quimico,
      elemento_proteccion,
    } = filtrosDto;

    // Construir filtros dinámicos
    const whereConditions: any = { deleted: false };

    // Filtro por fecha específica
    if (fecha) {
      const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
      const fechaFin = new Date(`${fecha}T00:00:00.000Z`);
      fechaFin.setDate(fechaFin.getDate() + 1);

      whereConditions.fecha = {
        gte: fechaInicio,
        lt: fechaFin,
      };
    }

    // Filtro por rango de fechas
    if (fecha_inicio && fecha_fin) {
      whereConditions.fecha = {
        gte: new Date(`${fecha_inicio}T00:00:00.000Z`),
        lte: new Date(`${fecha_fin}T23:59:59.999Z`),
      };
    }

    // Filtro por elemento de aseo
    if (elemento_aseo) {
      whereConditions.elementos_aseo = {
        has: elemento_aseo,
      };
    }

    // Filtro por producto químico
    if (producto_quimico) {
      whereConditions.productos_quimicos = {
        has: producto_quimico,
      };
    }

    // Filtro por elemento de protección
    if (elemento_proteccion) {
      whereConditions.elementos_proteccion = {
        has: elemento_proteccion,
      };
    }

    const totalReportes = await this.prisma.reporteAseoDiario.count({
      where: whereConditions,
    });

    const lastPage = Math.ceil(totalReportes / limit);

    const emptyData = emptyPaginationResponse(
      page,
      limit,
      totalReportes,
      lastPage,
    );

    if (totalReportes === 0 || page > emptyData.meta.lastPage) return emptyData;

    const reportes = await this.prisma.reporteAseoDiario.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereConditions,
      orderBy: { fecha: 'desc' },
    });

    return {
      data: reportes,
      meta: { page, limit, total: totalReportes, lastPage },
    };
  }

  /**
   * Busca un reporte de aseo por su ID.
   * @param id ID del reporte.
   * @returns El reporte encontrado.
   * @throws NotFoundException si el reporte no existe.
   */
  async findOne(id: number) {
    try {
      return await this.prisma.reporteAseoDiario.findFirstOrThrow({
        where: { id, deleted: false },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `No se encontró el reporte de aseo con ID: ${id}`,
        );
      }
      throw error;
    }
  }

  /**
   * Busca un reporte de aseo por fecha específica.
   * @param fecha Fecha del reporte (formato: YYYY-MM-DD).
   * @returns El reporte encontrado o null si no existe.
   */
  async findByFecha(fecha: string) {
    const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
    const fechaFin = new Date(`${fecha}T00:00:00.000Z`);
    fechaFin.setDate(fechaFin.getDate() + 1);

    return await this.prisma.reporteAseoDiario.findFirst({
      where: {
        fecha: {
          gte: fechaInicio,
          lt: fechaFin,
        },
        deleted: false,
      },
    });
  }

  /**
   * Actualiza los datos de un reporte de aseo por su ID.
   * @param id ID del reporte.
   * @param updateReportesAseoDto Datos para actualizar.
   * @returns El reporte actualizado.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si el reporte no existe.
   */
  async update(id: number, updateReportesAseoDto: UpdateReportesAseoDto) {
    if (!Object.keys(updateReportesAseoDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar el reporte de aseo.',
      );
    }

    try {
      return await this.prisma.reporteAseoDiario.update({
        where: { id, deleted: false },
        data: updateReportesAseoDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `No se encontró el reporte de aseo con ID: ${id}`,
        );
      }
      throw error;
    }
  }

  /**
   * Elimina (soft delete) un reporte de aseo por su ID.
   * @param id ID del reporte.
   * @returns El reporte eliminado.
   * @throws NotFoundException si el reporte no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.reporteAseoDiario.update({
        where: { id, deleted: false },
        data: { deleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `No se encontró el reporte de aseo con ID: ${id}`,
        );
      }
      throw error;
    }
  }

  /**
   * Genera un reporte de aseo automático para una fecha específica.
   * Recopila todos los registros de aseo de habitaciones y zonas comunes del día.
   * @param fecha Fecha para generar el reporte (formato: YYYY-MM-DD).
   * @returns El reporte generado.
   * @throws BadRequestException si ya existe un reporte para la fecha.
   */
  async generarReporte(fecha: string) {
    // Verificar si ya existe un reporte para esta fecha
    const reporteExistente = await this.prisma.reporteAseoDiario.findFirst({
      where: {
        fecha: {
          gte: new Date(`${fecha}T00:00:00.000Z`),
          lt: new Date(`${fecha}T23:59:59.999Z`),
        },
        deleted: false,
      },
    });

    if (reporteExistente) {
      throw new BadRequestException(
        `Ya existe un reporte de aseo para la fecha: ${fecha}`,
      );
    }

    // Obtener registros de habitaciones del día
    const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
    const fechaFin = new Date(`${fecha}T23:59:59.999Z`);
    fechaFin.setDate(fechaFin.getDate() + 1);

    const registrosHabitaciones =
      await this.prisma.registroAseoHabitacion.findMany({
        where: {
          fecha_registro: {
            gte: fechaInicio,
            lt: fechaFin,
          },
          deleted: false,
        },
      });

    // Obtener registros de zonas comunes del día
    const registrosZonasComunes =
      await this.prisma.registroAseoZonaComun.findMany({
        where: {
          fecha_registro: {
            gte: fechaInicio,
            lt: fechaFin,
          },
          deleted: false,
        },
      });

    // Generar resumen automático
    const resumen = {
      total_habitaciones_aseadas: registrosHabitaciones.length,
      total_zonas_comunes_aseadas: registrosZonasComunes.length,
      objetos_perdidos_encontrados: [
        ...registrosHabitaciones,
        ...registrosZonasComunes,
      ].filter((registro) => registro.objetos_perdidos).length,
      rastros_animales_encontrados: [
        ...registrosHabitaciones,
        ...registrosZonasComunes,
      ].filter((registro) => registro.rastros_de_animales).length,
    };

    // Crear el reporte con datos por defecto
    const datosReporte = {
      fecha: new Date(`${fecha}T00:00:00.000Z`),
      elementos_aseo: ['Escoba', 'Trapeador', 'Aspiradora'],
      elementos_proteccion: ['Guantes de látex', 'Mascarilla N95'],
      productos_quimicos: ['Desinfectante multiusos', 'Detergente líquido'],
      procedimiento_aseo_habitacion:
        'Ventilación, retiro de ropa de cama, limpieza de superficies',
      procedimiento_desinfeccion_habitacion:
        'Aplicación de desinfectante en todas las superficies',
      procedimiento_limpieza_zona_comun: 'Barrido, trapeado con desinfectante',
      procedimiento_desinfeccion_zona_comun: 'Nebulización con desinfectante',
      datos: {
        habitaciones: registrosHabitaciones,
        zonas_comunes: registrosZonasComunes,
        resumen,
      },
    };

    return await this.prisma.reporteAseoDiario.create({
      data: datosReporte,
    });
  }
}
