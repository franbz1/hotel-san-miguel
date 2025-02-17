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
} from '@nestjs/swagger';
import { Reserva } from './entities/reserva.entity'; // Importa la entidad Reserva

@ApiTags('reservas') // Agrupa las rutas
@Auth(Role.CAJERO, Role.ADMINISTRADOR) // Roles autorizados
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({ status: 201, description: 'Reserva creada', type: Reserva })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las reservas' })
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
    description: 'Lista de reservas',
    type: [Reserva],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.reservasService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({ name: 'id', description: 'ID de la reserva', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Reserva encontrada',
    type: Reserva,
  })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una reserva por ID' })
  @ApiParam({ name: 'id', description: 'ID de la reserva', type: Number })
  @ApiBody({ type: UpdateReservaDto })
  @ApiResponse({
    status: 200,
    description: 'Reserva actualizada',
    type: Reserva,
  })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservasService.update(id, updateReservaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reserva por ID' })
  @ApiParam({ name: 'id', description: 'ID de la reserva', type: Number })
  @ApiResponse({ status: 200, description: 'Reserva eliminada', type: Reserva })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.remove(id);
  }
}
