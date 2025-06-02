import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';
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
import { HuespedSecundario } from './entities/huesped-secundario.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('huespedes-secundarios')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(HuespedSecundario)
@Controller('huespedes-secundarios')
export class HuespedesSecundariosController {
  constructor(
    private readonly huespedesSecundariosService: HuespedesSecundariosService,
  ) {}

  // ================================================================
  // CREATE - Crear nuevo huésped secundario
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo huésped secundario' })
  @ApiBody({ type: CreateHuespedSecundarioDto })
  @ApiResponse({
    status: 201,
    description: 'Huésped secundario creado exitosamente',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({ status: 409, description: 'El número de documento ya existe' })
  create(@Body() CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    return this.huespedesSecundariosService.create(CreateHuespedSecundarioDto);
  }

  // ================================================================
  // READ - Listar todos los huéspedes secundarios (con paginación)
  // ================================================================
  @Get()
  @ApiOperation({
    summary: 'Listar todos los huéspedes secundarios con paginación',
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(
    createPaginatedApiResponse(HuespedSecundario, 'totalHuespedesSecundarios'),
  )
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesSecundariosService.findAll(paginationDto);
  }

  // ================================================================
  // READ - Listar huéspedes secundarios por huésped principal
  // ================================================================
  @Get('huespedId/:huespedId')
  @ApiOperation({
    summary: 'Listar huéspedes secundarios por ID de huésped principal',
  })
  @ApiParam({
    name: 'huespedId',
    description: 'ID del huésped principal',
    type: Number,
    example: 1,
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(
    createPaginatedApiResponse(
      HuespedSecundario,
      'totalHuespedesSecundarios',
      'Lista paginada de huéspedes secundarios del huésped principal con metadatos',
    ),
  )
  @ApiResponse({ status: 404, description: 'Huésped principal no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAllByHuespedId(
    @Param('huespedId', ParseIntPipe) huespedId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.huespedesSecundariosService.findAllHuespedesSecundariosByHuespedId(
      huespedId,
      paginationDto,
    );
  }

  // ================================================================
  // READ - Buscar huésped secundario por ID
  // ================================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un huésped secundario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped secundario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario encontrado',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesSecundariosService.findOne(id);
  }

  // ================================================================
  // READ - Buscar huésped secundario por número de documento
  // ================================================================
  @Get('numeroDocumento/:numeroDocumento')
  @ApiOperation({
    summary: 'Obtener un huésped secundario por número de documento',
  })
  @ApiParam({
    name: 'numeroDocumento',
    description: 'Número de documento del huésped secundario',
    type: String,
    example: '87654321',
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario encontrado',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByNumeroDocumento(@Param('numeroDocumento') numeroDocumento: string) {
    return this.huespedesSecundariosService.findByNumeroDocumento(
      numeroDocumento,
    );
  }

  // ================================================================
  // UPDATE - Actualizar huésped secundario por ID
  // ================================================================
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un huésped secundario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped secundario',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateHuespedSecundarioDto })
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario actualizado exitosamente',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateHuespedSecundarioDto: UpdateHuespedSecundarioDto,
  ) {
    return this.huespedesSecundariosService.update(
      id,
      UpdateHuespedSecundarioDto,
    );
  }

  // ================================================================
  // DELETE - Eliminar huésped secundario por ID (soft delete)
  // ================================================================
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un huésped secundario por ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped secundario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario eliminado exitosamente',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesSecundariosService.remove(id);
  }
}
