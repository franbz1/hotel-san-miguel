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
  UseGuards,
} from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
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
import { Habitacion } from './entities/habitacion.entity';
import { RangoFechasDto } from 'src/auth/dto/rangoFechasDto';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('habitaciones')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiExtraModels(Habitacion)
@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

  // ================================================================
  // CREATE - Crear nueva habitación
  // ================================================================
  @Roles(Role.ADMINISTRADOR)
  @Post()
  @ApiOperation({ summary: 'Crear una nueva habitación' })
  @ApiBody({ type: CreateHabitacionDto })
  @ApiResponse({
    status: 201,
    description: 'Habitación creada exitosamente',
    type: Habitacion,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes - Solo administradores',
  })
  create(@Body() createHabitacionDto: CreateHabitacionDto) {
    return this.habitacionesService.create(createHabitacionDto);
  }

  // ================================================================
  // READ - Listar todas las habitaciones (con paginación)
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @Get()
  @ApiOperation({ summary: 'Listar todas las habitaciones con paginación' })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(createPaginatedApiResponse(Habitacion, 'totalHabitaciones'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.habitacionesService.findAll(paginationDto);
  }

  // ================================================================
  // READ - Buscar habitación por número
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @Get('numero_habitacion/:numeroHabitacion')
  @ApiOperation({ summary: 'Buscar habitación por número de habitación' })
  @ApiParam({
    name: 'numeroHabitacion',
    description: 'Número de la habitación',
    type: Number,
    example: 101,
  })
  @ApiResponse({
    status: 200,
    description: 'Habitación encontrada',
    type: Habitacion,
  })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findByNumeroHabitacion(
    @Param('numeroHabitacion', ParseIntPipe) numeroHabitacion: number,
  ) {
    return this.habitacionesService.findByNumeroHabitacion(numeroHabitacion);
  }

  // ================================================================
  // READ - Buscar habitación por ID
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar habitación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la habitación',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Habitación encontrada',
    type: Habitacion,
  })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar habitación por ID
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar habitación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la habitación',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateHabitacionDto })
  @ApiResponse({
    status: 200,
    description: 'Habitación actualizada exitosamente',
    type: Habitacion,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHabitacionDto: UpdateHabitacionDto,
  ) {
    return this.habitacionesService.update(id, updateHabitacionDto);
  }

  // ================================================================
  // DELETE - Eliminar habitación por ID
  // ================================================================
  @Roles(Role.ADMINISTRADOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar habitación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la habitación',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Habitación eliminada exitosamente',
    type: Habitacion,
  })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes - Solo administradores',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.remove(id);
  }

  // ================================================================
  // BUSINESS LOGIC - Obtener habitaciones disponibles entre fechas
  // ================================================================
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @Post('disponibles')
  @ApiOperation({
    summary: 'Obtener habitaciones disponibles entre dos fechas',
    description:
      'Obtiene las habitaciones disponibles entre dos fechas. Las fechas se validan solo por día, sin considerar la hora exacta. La fecha de inicio debe ser igual o posterior al día actual, y la fecha de fin debe ser posterior a la fecha de inicio.',
  })
  @ApiBody({
    type: RangoFechasDto,
    description:
      'Rango de fechas para buscar habitaciones disponibles. Las fechas se validan solo por día.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de habitaciones disponibles',
    type: [Habitacion],
  })
  @ApiResponse({ status: 400, description: 'Rango de fechas inválido' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  getHabitacionesDisponiblesEntreFechas(
    @Body() rangoFechasDto: RangoFechasDto,
  ) {
    if (!rangoFechasDto.fechaInicio) {
      rangoFechasDto.fechaInicio = new Date(new Date().toISOString());
    }
    if (!rangoFechasDto.fechaFin) {
      const tomorrow = new Date(new Date().toISOString());
      tomorrow.setDate(tomorrow.getDate() + 1);
      rangoFechasDto.fechaFin = tomorrow;
    }

    return this.habitacionesService.getHabitacionesDisponiblesEntreFechas(
      rangoFechasDto.fechaInicio,
      rangoFechasDto.fechaFin,
    );
  }
}
