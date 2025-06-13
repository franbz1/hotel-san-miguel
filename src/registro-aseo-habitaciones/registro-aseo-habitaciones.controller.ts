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
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';
import { CreateRegistroAseoHabitacionDto } from './dto/create-registro-aseo-habitacion.dto';
import { UpdateRegistroAseoHabitacionDto } from './dto/update-registro-aseo-habitacion.dto';
import { FiltrosRegistroAseoHabitacionDto } from './dto/filtros-registro-aseo-habitacion.dto';

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
import { RegistroAseoHabitacion } from './entities/registro-aseo-habitacion.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

/**
 * Controller CRUD para manejar registros de aseo de habitaciones
 */
@ApiTags('registro-aseo-habitaciones')
@ApiBearerAuth()
@Auth(Role.ASEO, Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(RegistroAseoHabitacion)
@Controller('registro-aseo-habitaciones')
export class RegistroAseoHabitacionesController {
  constructor(
    private readonly registroAseoHabitacionesService: RegistroAseoHabitacionesService,
  ) {}

  // ================================================================
  // CREATE - Crear un registro de aseo de habitación
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear un registro de aseo de habitación' })
  @ApiBody({ type: CreateRegistroAseoHabitacionDto })
  @ApiResponse({
    status: 201,
    description: 'Registro de aseo creado exitosamente',
    type: RegistroAseoHabitacion,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  create(
    @Body() createRegistroAseoHabitacionDto: CreateRegistroAseoHabitacionDto,
  ) {
    return this.registroAseoHabitacionesService.create(
      createRegistroAseoHabitacionDto,
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
    name: 'habitacionId',
    description: 'Filtrar por ID de la habitación',
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
    enum: [
      'LIMPIEZA',
      'DESINFECCION',
      'ROTACION_COLCHONES',
      'LIMPIEZA_BANIO',
      'DESINFECCION_BANIO',
    ],
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
    createPaginatedApiResponse(RegistroAseoHabitacion, 'totalRegistros'),
  )
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() filtrosDto: FiltrosRegistroAseoHabitacionDto) {
    return this.registroAseoHabitacionesService.findAll(filtrosDto, filtrosDto);
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
    type: RegistroAseoHabitacion,
  })
  @ApiResponse({ status: 404, description: 'Registro de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registroAseoHabitacionesService.findOne(id);
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
  @ApiBody({ type: UpdateRegistroAseoHabitacionDto })
  @ApiResponse({
    status: 200,
    description: 'Registro de aseo actualizado exitosamente',
    type: RegistroAseoHabitacion,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Registro de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegistroAseoHabitacionDto: UpdateRegistroAseoHabitacionDto,
  ) {
    return this.registroAseoHabitacionesService.update(
      id,
      updateRegistroAseoHabitacionDto,
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
    type: RegistroAseoHabitacion,
  })
  @ApiResponse({ status: 404, description: 'Registro de aseo no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registroAseoHabitacionesService.remove(id);
  }

  // ================================================================
  // ENDPOINTS ESPECÍFICOS - Búsquedas especializadas
  // ================================================================

  @Get('habitacion/:id')
  @ApiOperation({ summary: 'Obtener registros de aseo por ID de habitación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la habitación',
    type: Number,
    example: 101,
  })
  @ApiResponse({
    status: 200,
    description: 'Registros de aseo de la habitación',
    type: [RegistroAseoHabitacion],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByHabitacion(@Param('id', ParseIntPipe) habitacionId: number) {
    return this.registroAseoHabitacionesService.findByHabitacion(habitacionId);
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
    type: [RegistroAseoHabitacion],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByUsuario(@Param('id', ParseIntPipe) usuarioId: number) {
    return this.registroAseoHabitacionesService.findByUsuario(usuarioId);
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
    type: [RegistroAseoHabitacion],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByFecha(@Param('fecha') fecha: string) {
    return this.registroAseoHabitacionesService.findByFecha(fecha);
  }
}
