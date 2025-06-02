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
} from '@nestjs/swagger';
import { Habitacion } from './entities/habitacion.entity'; // Importa la entidad Habitacion
import { RangoFechasDto } from 'src/auth/dto/rangoFechasDto';

@ApiTags('habitaciones') // Agrupa las rutas bajo el tag "habitaciones"
@ApiBearerAuth()
@UseGuards(AuthGuard) // Usa el guard de autenticación
@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(@Body() createHabitacionDto: CreateHabitacionDto) {
    return this.habitacionesService.create(createHabitacionDto);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @Get()
  @ApiOperation({ summary: 'Listar todas las habitaciones con paginación' })
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
    description: 'Lista de habitaciones obtenida exitosamente',
    type: [Habitacion],
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.habitacionesService.findAll(paginationDto);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findByNumeroHabitacion(
    @Param('numeroHabitacion', ParseIntPipe) numeroHabitacion: number,
  ) {
    return this.habitacionesService.findByNumeroHabitacion(numeroHabitacion);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.findOne(id);
  }

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
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHabitacionDto: UpdateHabitacionDto,
  ) {
    return this.habitacionesService.update(id, updateHabitacionDto);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.remove(id);
  }

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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
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
