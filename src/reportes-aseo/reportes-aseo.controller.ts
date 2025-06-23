import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportesAseoService } from './reportes-aseo.service';
import { CreateReportesAseoDto } from './dto/create-reportes-aseo.dto';
import { UpdateReportesAseoDto } from './dto/update-reportes-aseo.dto';
import { FiltrosReportesAseoDto } from './dto/filtros-reportes-aseo.dto';

import { Role } from 'src/usuarios/entities/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ReporteAseoDiario } from './entities/reportes-aseo.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

/**
 * Controller CRUD para manejar reportes diarios de aseo
 */
@ApiTags('reportes-aseo')
@ApiBearerAuth()
@Auth(Role.ASEO, Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(ReporteAseoDiario)
@Controller('reportes-aseo')
export class ReportesAseoController {
  constructor(private readonly reportesAseoService: ReportesAseoService) {}

  // ================================================================
  // CREATE - Crear un reporte de aseo diario
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear un reporte de aseo diario' })
  @ApiBody({ type: CreateReportesAseoDto })
  @ApiResponse({
    status: 201,
    description: 'Reporte de aseo creado exitosamente',
    type: ReporteAseoDiario,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o reporte ya existe para la fecha',
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  create(@Body() createReportesAseoDto: CreateReportesAseoDto) {
    return this.reportesAseoService.create(createReportesAseoDto);
  }

  // ================================================================
  // READ - Listar todos los reportes con paginación y filtros
  // ================================================================
  @Get()
  @ApiOperation({
    summary: 'Listar todos los reportes de aseo con paginación y filtros',
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiQuery({
    name: 'fecha',
    description: 'Filtrar por fecha específica (YYYY-MM-DD)',
    required: false,
    type: String,
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'fecha_inicio',
    description: 'Filtrar por rango de fechas - fecha inicial (YYYY-MM-DD)',
    required: false,
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fecha_fin',
    description: 'Filtrar por rango de fechas - fecha final (YYYY-MM-DD)',
    required: false,
    type: String,
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'elemento_aseo',
    description: 'Filtrar por elemento de aseo específico',
    required: false,
    type: String,
    example: 'Aspiradora',
  })
  @ApiQuery({
    name: 'producto_quimico',
    description: 'Filtrar por producto químico específico',
    required: false,
    type: String,
    example: 'Desinfectante multiusos',
  })
  @ApiQuery({
    name: 'elemento_proteccion',
    description: 'Filtrar por elemento de protección específico',
    required: false,
    type: String,
    example: 'Guantes de látex',
  })
  @ApiResponse(createPaginatedApiResponse(ReporteAseoDiario, 'totalReportes'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() filtrosDto: FiltrosReportesAseoDto) {
    return this.reportesAseoService.findAll(filtrosDto);
  }

  // ================================================================
  // READ - Buscar un reporte por id
  // ================================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un reporte de aseo por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del reporte de aseo',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de aseo encontrado',
    type: ReporteAseoDiario,
  })
  @ApiResponse({ status: 404, description: 'Reporte de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportesAseoService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar un reporte por id
  // ================================================================
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un reporte de aseo por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del reporte de aseo',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateReportesAseoDto })
  @ApiResponse({
    status: 200,
    description: 'Reporte de aseo actualizado exitosamente',
    type: ReporteAseoDiario,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Reporte de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportesAseoDto: UpdateReportesAseoDto,
  ) {
    return this.reportesAseoService.update(id, updateReportesAseoDto);
  }

  // ================================================================
  // DELETE - Eliminar un reporte por id
  // ================================================================
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un reporte de aseo por ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del reporte de aseo',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de aseo eliminado exitosamente',
    type: ReporteAseoDiario,
  })
  @ApiResponse({ status: 404, description: 'Reporte de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportesAseoService.remove(id);
  }

  // ================================================================
  // READ - Buscar reporte por fecha específica
  // ================================================================
  @Get('fecha/:fecha')
  @ApiOperation({ summary: 'Obtener reporte de aseo por fecha específica' })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha del reporte (formato: YYYY-MM-DD)',
    type: String,
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de aseo encontrado para la fecha',
    type: ReporteAseoDiario,
  })
  @ApiResponse({
    status: 200,
    description: 'No existe reporte para la fecha especificada',
    schema: { type: 'null' },
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByFecha(@Param('fecha') fecha: string) {
    return this.reportesAseoService.findByFecha(fecha);
  }

  // ================================================================
  // POST - Generar reporte automático
  // ================================================================
  @Post('generar')
  @ApiOperation({
    summary: 'Generar reporte de aseo automático para una fecha',
  })
  @ApiBody({
    description: 'Fecha para generar el reporte',
    schema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          format: 'date',
          example: '2024-01-15',
          description: 'Fecha para generar el reporte (formato: YYYY-MM-DD)',
        },
      },
      required: ['fecha'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reporte de aseo generado exitosamente',
    type: ReporteAseoDiario,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un reporte para la fecha especificada',
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  generarReporte(@Body() body: { fecha: string }) {
    return this.reportesAseoService.generarReporte(body.fecha);
  }
}
