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
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
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
import { Reserva } from './entities/reserva.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('reservas')
@ApiBearerAuth()
@Auth(Role.CAJERO, Role.ADMINISTRADOR)
@ApiExtraModels(Reserva)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  // ================================================================
  // CREATE - Crear nueva reserva
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({
    status: 201,
    description: 'Reserva creada exitosamente',
    type: Reserva,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({
    status: 400,
    description: 'El huésped no existe o no se encontró la habitación',
  })
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  // ================================================================
  // READ - Listar todas las reservas (con paginación)
  // ================================================================
  @Get()
  @ApiOperation({ summary: 'Listar todas las reservas con paginación' })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(createPaginatedApiResponse(Reserva, 'totalReservas'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.reservasService.findAll(paginationDto);
  }

  // ================================================================
  // READ - Buscar reserva por ID
  // ================================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la reserva',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva encontrada',
    type: Reserva,
  })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar reserva por ID
  // ================================================================
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una reserva por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la reserva',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateReservaDto })
  @ApiResponse({
    status: 200,
    description: 'Reserva actualizada exitosamente',
    type: Reserva,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservasService.update(id, updateReservaDto);
  }

  // ================================================================
  // DELETE - Eliminar reserva por ID (soft delete con cascada)
  // ================================================================
  @Delete(':id')
  @ApiOperation({
    summary:
      'Eliminar una reserva por ID (soft delete con eliminación en cascada)',
    description:
      'Elimina una reserva y todas las entidades relacionadas mediante soft delete:\n\n' +
      '**Entidades que se eliminan:**\n' +
      '- La reserva seleccionada\n' +
      '- Todos los formularios relacionados con la reserva\n' +
      '- Todos los enlaces de formulario (LinkFormulario) relacionados\n' +
      '- La factura asociada (si existe)\n' +
      '- Los huéspedes secundarios (solo si no tienen otras reservas activas)\n' +
      '- El huésped principal (solo si no tiene otras reservas activas)\n\n' +
      '**Entidades que NO se eliminan:**\n' +
      '- Habitación (se mantiene disponible para futuras reservas)\n' +
      '- Huéspedes que tengan otras reservas activas (se preservan)\n\n' +
      '**Nota:** Esta operación utiliza transacciones para garantizar la consistencia de los datos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la reserva a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva y entidades relacionadas eliminadas exitosamente',
    type: Reserva,
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva no encontrada o ya eliminada',
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor durante la eliminación en cascada',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.remove(id);
  }
}
