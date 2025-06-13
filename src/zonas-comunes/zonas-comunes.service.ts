import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateZonaComunDto } from './dto/create-zona-comun.dto';
import { UpdateZonaComunDto } from './dto/update-zona-comun.dto';
import { FiltrosZonaComunDto } from './dto/filtros-zona-comun.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import emptyPaginationResponse from 'src/common/responses/emptyPaginationResponse';

/**
 * Service CRUD para manejar zonas comunes
 */
@Injectable()
export class ZonasComunesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva zona común.
   * @param createZonaComunDto Datos de la zona común a crear.
   * @returns La zona común creada.
   */
  async create(createZonaComunDto: CreateZonaComunDto) {
    try {
      return await this.prisma.zonaComun.create({
        data: createZonaComunDto,
        select: this.defaultZonaComunSelection(),
      });
    } catch {
      throw new BadRequestException('Error al crear zona común');
    }
  }

  /**
   * Obtiene todas las zonas comunes con paginación y filtros.
   * @param paginationDto Datos de paginación.
   * @param filtrosDto Filtros de búsqueda.
   * @returns Objeto con la lista de zonas comunes y metadatos de paginación.
   */
  async findAll(paginationDto: PaginationDto, filtrosDto: FiltrosZonaComunDto) {
    const { page, limit } = paginationDto;

    // Construir el objeto where con los filtros
    const whereCondition: any = { deleted: false };

    if (filtrosDto.piso !== undefined) {
      whereCondition.piso = filtrosDto.piso;
    }

    if (filtrosDto.requerido_aseo_hoy !== undefined) {
      whereCondition.requerido_aseo_hoy = filtrosDto.requerido_aseo_hoy;
    }

    if (filtrosDto.ultimo_aseo_tipo !== undefined) {
      whereCondition.ultimo_aseo_tipo = filtrosDto.ultimo_aseo_tipo;
    }

    const total = await this.prisma.zonaComun.count({
      where: whereCondition,
    });

    const lastPage = Math.ceil(total / limit);

    const emptyData = emptyPaginationResponse(page, limit, total, lastPage);

    if (total === 0 || page > emptyData.meta.lastPage) return emptyData;

    const zonasComunes = await this.prisma.zonaComun.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereCondition,
      select: this.defaultZonaComunSelection(),
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: zonasComunes,
      meta: { page, limit, total, lastPage },
    };
  }

  /**
   * Busca una zona común por su ID.
   * @param id ID de la zona común.
   * @returns La zona común encontrada.
   * @throws NotFoundException si la zona común no existe.
   */
  async findOne(id: number) {
    const zonaComun = await this.prisma.zonaComun.findFirst({
      where: { id, deleted: false },
      select: this.defaultZonaComunSelection(),
    });

    if (!zonaComun) {
      throw new NotFoundException(`Zona común con ID ${id} no encontrada`);
    }

    return zonaComun;
  }

  /**
   * Actualiza los datos de una zona común por su ID.
   * @param id ID de la zona común.
   * @param updateZonaComunDto Datos para actualizar.
   * @returns La zona común actualizada.
   * @throws BadRequestException si no se proporcionan datos para actualizar.
   * @throws NotFoundException si la zona común no existe.
   */
  async update(id: number, updateZonaComunDto: UpdateZonaComunDto) {
    if (!Object.keys(updateZonaComunDto).length) {
      throw new BadRequestException(
        'Debe enviar datos para actualizar la zona común',
      );
    }

    try {
      return await this.prisma.zonaComun.update({
        where: { id, deleted: false },
        data: updateZonaComunDto,
        select: this.defaultZonaComunSelection(),
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Zona común con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Elimina (soft delete) una zona común por su ID.
   * @param id ID de la zona común.
   * @returns La zona común eliminada.
   * @throws NotFoundException si la zona común no existe.
   */
  async remove(id: number) {
    try {
      return await this.prisma.zonaComun.update({
        where: { id, deleted: false },
        data: { deleted: true },
        select: this.defaultZonaComunSelection(),
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Zona común con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Obtiene todas las zonas comunes de un piso específico.
   * @param piso Número del piso.
   * @returns Lista de zonas comunes del piso.
   */
  async findByPiso(piso: number) {
    return await this.prisma.zonaComun.findMany({
      where: { piso, deleted: false },
      select: this.defaultZonaComunSelection(),
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Obtiene todas las zonas comunes que requieren aseo hoy.
   * @returns Lista de zonas comunes que requieren aseo.
   */
  async findRequierenAseo() {
    return await this.prisma.zonaComun.findMany({
      where: { requerido_aseo_hoy: true, deleted: false },
      select: this.defaultZonaComunSelection(),
      orderBy: [{ piso: 'asc' }, { nombre: 'asc' }],
    });
  }

  /**
   * Selección predeterminada para los campos de la zona común.
   * @returns Objeto de selección para Prisma.
   */
  private defaultZonaComunSelection() {
    return {
      id: true,
      nombre: true,
      piso: true,
      requerido_aseo_hoy: true,
      ultimo_aseo_fecha: true,
      ultimo_aseo_tipo: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
