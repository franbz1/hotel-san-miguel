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
  UseGuards,
} from '@nestjs/common';
import { ZonasComunesService } from './zonas-comunes.service';
import { CreateZonaComunDto } from './dto/create-zona-comun.dto';
import { UpdateZonaComunDto } from './dto/update-zona-comun.dto';
import { FiltrosZonaComunDto } from './dto/filtros-zona-comun.dto';
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
import { ZonaComun } from './entities/zona-comun.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

/**
 * Controller CRUD para manejar zonas comunes
 */
@ApiTags('zonas-comunes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiExtraModels(ZonaComun)
@Controller('zonas-comunes')
export class ZonasComunesController {
  constructor(private readonly zonasComunesService: ZonasComunesService) {}

  // ================================================================
  // CREATE - Crear una zona común
  // ================================================================
  @Roles(Role.ADMINISTRADOR)
  @Post()
  @ApiOperation({ summary: 'Crear una zona común' })
  @ApiBody({ type: CreateZonaComunDto })
  @ApiResponse({
    status: 201,
    description: 'Zona común creada exitosamente',
    type: ZonaComun,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  create(@Body() createZonaComunDto: CreateZonaComunDto) {
    return this.zonasComunesService.create(createZonaComunDto);
  }

  // ================================================================
  // READ - Listar todas las zonas comunes con paginación y filtros
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.ASEO, Role.CAJERO)
  @Get()
  @ApiOperation({
    summary: 'Listar todas las zonas comunes con paginación y filtros',
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiQuery({
    name: 'piso',
    description: 'Filtrar por número de piso',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'requerido_aseo_hoy',
    description: 'Filtrar por zonas que requieren aseo hoy',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'ultimo_aseo_tipo',
    description: 'Filtrar por tipo del último aseo realizado',
    enum: [
      'LIMPIEZA',
      'DESINFECCION',
      'ROTACION_COLCHONES',
      'LIMPIEZA_BANIO',
      'DESINFECCION_BANIO',
    ],
    required: false,
  })
  @ApiResponse(createPaginatedApiResponse(ZonaComun, 'totalZonasComunes'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @Auth(Role.ADMINISTRADOR, Role.ASEO)
  findAll(@Query() filtrosDto: FiltrosZonaComunDto) {
    return this.zonasComunesService.findAll(filtrosDto, filtrosDto);
  }

  // ================================================================
  // READ - Obtener zonas comunes que requieren aseo
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.ASEO, Role.CAJERO)
  @Get('requieren-aseo')
  @ApiOperation({ summary: 'Obtener zonas comunes que requieren aseo hoy' })
  @ApiResponse({
    status: 200,
    description: 'Zonas comunes que requieren aseo',
    type: [ZonaComun],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @Auth(Role.ADMINISTRADOR, Role.ASEO)
  findRequierenAseo() {
    return this.zonasComunesService.findRequierenAseo();
  }

  // ================================================================
  // READ - Obtener zonas comunes por piso
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.ASEO, Role.CAJERO)
  @Get('piso/:piso')
  @ApiOperation({ summary: 'Obtener zonas comunes por piso' })
  @ApiParam({
    name: 'piso',
    description: 'Número del piso',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Zonas comunes del piso',
    type: [ZonaComun],
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @Auth(Role.ADMINISTRADOR, Role.ASEO)
  findByPiso(@Param('piso', ParseIntPipe) piso: number) {
    return this.zonasComunesService.findByPiso(piso);
  }

  // ================================================================
  // READ - Buscar una zona común por id
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.ASEO, Role.CAJERO)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una zona común por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la zona común',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Zona común encontrada',
    type: ZonaComun,
  })
  @ApiResponse({ status: 404, description: 'Zona común no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @Auth(Role.ADMINISTRADOR, Role.ASEO)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.zonasComunesService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar una zona común por id
  // ================================================================
  @Roles(Role.ADMINISTRADOR)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una zona común por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la zona común',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateZonaComunDto })
  @ApiResponse({
    status: 200,
    description: 'Zona común actualizada exitosamente',
    type: ZonaComun,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Zona común no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateZonaComunDto: UpdateZonaComunDto,
  ) {
    return this.zonasComunesService.update(id, updateZonaComunDto);
  }

  // ================================================================
  // DELETE - Eliminar una zona común por id
  // ================================================================
  @Roles(Role.ADMINISTRADOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una zona común por ID (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la zona común',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Zona común eliminada exitosamente',
    type: ZonaComun,
  })
  @ApiResponse({ status: 404, description: 'Zona común no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonasComunesService.remove(id);
  }
}
