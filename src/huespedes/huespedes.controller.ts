import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { HuespedesService } from './huespedes.service';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedDto } from './dto/update-huesped.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
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
import { Huesped } from './entities/huesped.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('huespedes')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(Huesped)
@Controller('huespedes')
export class HuespedesController {
  constructor(private readonly huespedesService: HuespedesService) {}

  // ================================================================
  // CREATE - Crear nuevo huésped
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo huésped' })
  @ApiBody({ type: CreateHuespedDto })
  @ApiResponse({
    status: 201,
    description: 'Huésped creado exitosamente',
    type: Huesped,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({ status: 400, description: 'El huésped ya existe' })
  create(@Body() CreateHuespedDto: CreateHuespedDto) {
    return this.huespedesService.create(CreateHuespedDto);
  }

  // ================================================================
  // READ - Listar todos los huéspedes (con paginación)
  // ================================================================
  @Get()
  @ApiOperation({ summary: 'Listar todos los huéspedes con paginación' })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(createPaginatedApiResponse(Huesped, 'totalHuespedes'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesService.findAll(paginationDto);
  }

  // ================================================================
  // READ - Buscar huésped por ID
  // ================================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un huésped por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped encontrado',
    type: Huesped,
  })
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.findOne(id);
  }

  // ================================================================
  // READ - Buscar huésped por número de documento
  // ================================================================
  @Get('documento/:documentoId')
  @ApiOperation({ summary: 'Obtener un huésped por número de documento' })
  @ApiParam({
    name: 'documentoId',
    description: 'Número de documento del huésped',
    example: '12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped encontrado',
    type: Huesped,
  })
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByDocumentoId(@Param('documentoId') documentoId: string) {
    return this.huespedesService.findByDocumentoId(documentoId);
  }

  // ================================================================
  // UPDATE - Actualizar huésped por ID
  // ================================================================
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un huésped por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateHuespedDto })
  @ApiResponse({
    status: 200,
    description: 'Huésped actualizado exitosamente',
    type: Huesped,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHuespedDto: UpdateHuespedDto,
  ) {
    return this.huespedesService.update(id, updateHuespedDto);
  }

  // ================================================================
  // DELETE - Eliminar huésped por ID (soft delete)
  // ================================================================
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un huésped por ID (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped eliminado exitosamente',
    type: Huesped,
  })
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.remove(id);
  }
}
