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
import { RegistroAseoZonasComunesService } from './registro-aseo-zonas-comunes.service';
import { CreateRegistroAseoZonaComunDto } from './dto/create-registro-aseo-zonas-comune.dto';
import { UpdateRegistroAseoZonaComunDto } from './dto/update-registro-aseo-zonas-comune.dto';
import { FiltrosRegistroAseoZonaComunDto } from './dto/filtros-registro-aseo-zona-comun.dto';

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
import { RegistroAseoZonaComun } from './entities/registro-aseo-zonas-comune.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

/**
 * Controller CRUD para manejar registros de aseo de zonas comunes
 */
@ApiTags('registro-aseo-zonas-comunes')
@ApiBearerAuth()
@Auth(Role.ASEO, Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(RegistroAseoZonaComun)
@Controller('registro-aseo-zonas-comunes')
export class RegistroAseoZonasComunesController {
  constructor(
    private readonly registroAseoZonasComunesService: RegistroAseoZonasComunesService,
  ) {}

  // ================================================================
  // CREATE - Crear un registro de aseo de zona común
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear un registro de aseo de zona común' })
  @ApiBody({ type: CreateRegistroAseoZonaComunDto })
  @ApiResponse({
    status: 201,
    description: 'Registro de aseo creado exitosamente',
    type: RegistroAseoZonaComun,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  create(
    @Body() createRegistroAseoZonaComunDto: CreateRegistroAseoZonaComunDto,
  ) {
    return this.registroAseoZonasComunesService.create(
      createRegistroAseoZonaComunDto,
    );
  }

  // ================================================================
  // READ - Listar todos los registros con paginación y filtros
  // ================================================================
  @Get()
  @ApiOperation({
    summary: 'Listar todos los registros de aseo con paginación y filtros',
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiQuery({
    name: 'usuarioId',
    description: 'Filtrar por ID del usuario',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'zonaComunId',
    description: 'Filtrar por ID de la zona común',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'fecha',
    description: 'Filtrar por fecha específica (YYYY-MM-DD)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'tipo_aseo',
    description: 'Filtrar por tipo de aseo realizado',
    required: false,
    enum: ['LIMPIEZA', 'DESINFECCION', 'MANTENIMIENTO', 'LIMPIEZA_PROFUNDA'],
  })
  @ApiQuery({
    name: 'objetos_perdidos',
    description: 'Filtrar por registros con objetos perdidos',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'rastros_de_animales',
    description: 'Filtrar por registros con rastros de animales',
    required: false,
    type: Boolean,
  })
  @ApiResponse(
    createPaginatedApiResponse(RegistroAseoZonaComun, 'totalRegistros'),
  )
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() filtrosDto: FiltrosRegistroAseoZonaComunDto) {
    return this.registroAseoZonasComunesService.findAll(filtrosDto, filtrosDto);
  }

  // ================================================================
  // READ - Buscar un registro por id
  // ================================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de aseo por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de aseo',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de aseo encontrado',
    type: RegistroAseoZonaComun,
  })
  @ApiResponse({ status: 404, description: 'Registro de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registroAseoZonasComunesService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar un registro por id
  // ================================================================
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un registro de aseo por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de aseo',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateRegistroAseoZonaComunDto })
  @ApiResponse({
    status: 200,
    description: 'Registro de aseo actualizado exitosamente',
    type: RegistroAseoZonaComun,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Registro de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegistroAseoZonaComunDto: UpdateRegistroAseoZonaComunDto,
  ) {
    return this.registroAseoZonasComunesService.update(
      id,
      updateRegistroAseoZonaComunDto,
    );
  }

  // ================================================================
  // DELETE - Eliminar un registro por id
  // ================================================================
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un registro de aseo por ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de aseo',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de aseo eliminado exitosamente',
    type: RegistroAseoZonaComun,
  })
  @ApiResponse({ status: 404, description: 'Registro de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registroAseoZonasComunesService.remove(id);
  }

  // ================================================================
  // ENDPOINTS ESPECÍFICOS - Búsquedas especializadas
  // ================================================================

  @Get('zona-comun/:id')
  @ApiOperation({ summary: 'Obtener registros de aseo por ID de zona común' })
  @ApiParam({
    name: 'id',
    description: 'ID de la zona común',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de aseo de la zona común',
    type: [RegistroAseoZonaComun],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByZonaComun(@Param('id', ParseIntPipe) zonaComunId: number) {
    return this.registroAseoZonasComunesService.findByZonaComun(zonaComunId);
  }

  @Get('usuario/:id')
  @ApiOperation({ summary: 'Obtener registros de aseo por ID de usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de aseo del usuario',
    type: [RegistroAseoZonaComun],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByUsuario(@Param('id', ParseIntPipe) usuarioId: number) {
    return this.registroAseoZonasComunesService.findByUsuario(usuarioId);
  }

  @Get('fecha/:fecha')
  @ApiOperation({ summary: 'Obtener registros de aseo por fecha específica' })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha en formato YYYY-MM-DD',
    type: String,
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de aseo de la fecha',
    type: [RegistroAseoZonaComun],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByFecha(@Param('fecha') fecha: string) {
    return this.registroAseoZonasComunesService.findByFecha(fecha);
  }
}
