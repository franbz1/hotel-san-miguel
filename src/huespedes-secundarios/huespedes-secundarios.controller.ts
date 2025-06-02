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
} from '@nestjs/swagger';
import { HuespedSecundario } from './entities/huesped-secundario.entity'; // Importa la entidad

@ApiTags('huespedes-secundarios') // Agrupa las rutas
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO) // Roles autorizados
@Controller('huespedes-secundarios')
export class HuespedesSecundariosController {
  constructor(
    private readonly huespedesSecundariosService: HuespedesSecundariosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo huésped secundario' })
  @ApiBody({ type: CreateHuespedSecundarioDto })
  @ApiResponse({
    status: 201,
    description: 'Huésped secundario creado exitosamente',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 409, description: 'El número de documento ya existe' })
  create(@Body() CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    return this.huespedesSecundariosService.create(CreateHuespedSecundarioDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los huéspedes secundarios con paginación',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página (por defecto: 1)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados por página (por defecto: 10)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de huéspedes secundarios obtenida exitosamente',
    type: [HuespedSecundario],
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesSecundariosService.findAll(paginationDto);
  }

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
  @ApiQuery({
    name: 'page',
    description: 'Número de página (por defecto: 1)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados por página (por defecto: 10)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de huéspedes secundarios del huésped principal',
    type: [HuespedSecundario],
  })
  @ApiResponse({ status: 404, description: 'Huésped principal no encontrado' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAllByHuespedId(
    @Param('huespedId', ParseIntPipe) huespedId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.huespedesSecundariosService.findAllHuespedesSecundariosByHuespedId(
      huespedId,
      paginationDto,
    );
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesSecundariosService.findOne(id);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findByNumeroDocumento(@Param('numeroDocumento') numeroDocumento: string) {
    return this.huespedesSecundariosService.findByNumeroDocumento(
      numeroDocumento,
    );
  }

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
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateHuespedSecundarioDto: UpdateHuespedSecundarioDto,
  ) {
    return this.huespedesSecundariosService.update(
      id,
      UpdateHuespedSecundarioDto,
    );
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesSecundariosService.remove(id);
  }
}
