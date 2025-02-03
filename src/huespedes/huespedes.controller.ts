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
  @ApiOperation({ summary: 'Crear un huésped' })
  @ApiBody({ type: CreateHuespedDto })
  @ApiResponse({ status: 201, description: 'Huésped creado', type: Huesped }) // Usa la entidad Huesped
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() CreateHuespedDto: CreateHuespedDto) {
    return this.huespedesService.create(CreateHuespedDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los huéspedes' })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados por página',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de huéspedes',
    type: [Huesped],
  }) // Usa la entidad Huesped
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un huésped por ID' })
  @ApiParam({ name: 'id', description: 'ID del huésped', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Huésped encontrado',
    type: Huesped,
  }) // Usa la entidad Huesped
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.findOne(id);
  }

  @Get('documento/:documentoId')
  @ApiOperation({ summary: 'Obtener un huésped por número de documento' })
  @ApiParam({
    name: 'documentoId',
    description: 'Número de documento del huésped',
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped encontrado',
    type: Huesped,
  }) // Usa la entidad Huesped
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  findByDocumentoId(@Param('documentoId') documentoId: string) {
    return this.huespedesService.findByDocumentoId(documentoId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un huésped por ID' })
  @ApiParam({ name: 'id', description: 'ID del huésped', type: Number })
  @ApiBody({ type: UpdateHuespedDto })
  @ApiResponse({
    status: 200,
    description: 'Huésped actualizado',
    type: Huesped,
  }) // Usa la entidad Huesped
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHuespedDto: UpdateHuespedDto,
  ) {
    return this.huespedesService.update(id, updateHuespedDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un huésped por ID' })
  @ApiParam({ name: 'id', description: 'ID del huésped', type: Number })
  @ApiResponse({ status: 200, description: 'Huésped eliminado', type: Huesped }) // Usa la entidad Huesped
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.remove(id);
  }
}
