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
} from '@nestjs/swagger';
import { Huesped } from './entities/huesped.entity'; // Importa la entidad Huesped

@ApiBearerAuth() // Protege la ruta con JWT
@ApiTags('huespedes') // Agrupa las rutas bajo el tag "huespedes"
@Auth(Role.ADMINISTRADOR, Role.CAJERO) // Roles autorizados
@Controller('huespedes')
export class HuespedesController {
  constructor(private readonly huespedesService: HuespedesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo huésped' })
  @ApiBody({ type: CreateHuespedDto })
  @ApiResponse({
    status: 201,
    description: 'Huésped creado exitosamente',
    type: Huesped,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 409, description: 'El número de documento ya existe' })
  create(@Body() CreateHuespedDto: CreateHuespedDto) {
    return this.huespedesService.create(CreateHuespedDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los huéspedes con paginación' })
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
    description: 'Lista de huéspedes obtenida exitosamente',
    type: [Huesped],
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesService.findAll(paginationDto);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.findOne(id);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findByDocumentoId(@Param('documentoId') documentoId: string) {
    return this.huespedesService.findByDocumentoId(documentoId);
  }

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
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHuespedDto: UpdateHuespedDto,
  ) {
    return this.huespedesService.update(id, updateHuespedDto);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.remove(id);
  }
}
