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
} from '@nestjs/swagger';
import { Habitacion } from './entities/habitacion.entity'; // Importa la entidad Habitacion

@ApiTags('habitaciones') // Agrupa las rutas bajo el tag "habitaciones"
@UseGuards(AuthGuard) // Usa el guard de autenticación
@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

  @Roles(Role.ADMINISTRADOR) // Roles permitidos
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear una nueva habitación' })
  @ApiBody({ type: CreateHabitacionDto })
  @ApiResponse({
    status: 201,
    description: 'Habitación creada',
    type: Habitacion,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createHabitacionDto: CreateHabitacionDto) {
    return this.habitacionesService.create(createHabitacionDto);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todas las habitaciones' })
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
    description: 'Lista de habitaciones',
    type: [Habitacion],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.habitacionesService.findAll(paginationDto);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Get('numero_habitacion/:numeroHabitacion')
  @ApiOperation({ summary: 'Buscar habitación por número' })
  @ApiParam({
    name: 'numeroHabitacion',
    description: 'Número de la habitación',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Habitación encontrada',
    type: Habitacion,
  })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  findByNumeroHabitacion(
    @Param('numeroHabitacion', ParseIntPipe) numeroHabitacion: number,
  ) {
    return this.habitacionesService.findByNumeroHabitacion(numeroHabitacion);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar habitación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la habitación', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Habitación encontrada',
    type: Habitacion,
  })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.findOne(id);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar habitación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la habitación', type: Number })
  @ApiBody({ type: UpdateHabitacionDto })
  @ApiResponse({
    status: 200,
    description: 'Habitación actualizada',
    type: Habitacion,
  })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHabitacionDto: UpdateHabitacionDto,
  ) {
    return this.habitacionesService.update(id, updateHabitacionDto);
  }

  @Roles(Role.ADMINISTRADOR)
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar habitación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la habitación', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Habitación eliminada',
    type: Habitacion,
  })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.remove(id);
  }
}
