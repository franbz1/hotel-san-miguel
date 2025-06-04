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
import { FiltrosReservaDto } from './dto/filtros-reserva.dto';
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
  // SEARCH - Buscar reservas con filtros múltiples (patrón Query Builder)
  // ================================================================
  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar reservas con filtros múltiples',
    description:
      'Endpoint que permite búsqueda avanzada de reservas con múltiples filtros:\n\n' +
      '**Filtros disponibles:**\n' +
      '- **Fechas**: Rango de fechas de inicio y check-in\n' +
      '- **Estado**: Filtrar por estado de la reserva (RESERVADO, CANCELADO, etc.)\n' +
      '- **Geográficos**: País y ciudad de procedencia\n' +
      '- **Motivo de viaje**: Filtrar por propósito del viaje\n' +
      '- **Costo**: Rango de precios mínimo y máximo\n' +
      '- **Acompañantes**: Rango de número de acompañantes\n' +
      '- **Habitación/Huésped**: Filtrar por IDs específicos\n' +
      '- **Búsqueda libre**: Texto en nombres, apellidos o documento del huésped\n' +
      '- **Ordenamiento**: Por fecha, costo, etc. (ASC/DESC)\n\n' +
      '**Características:**\n' +
      '- ✅ Paginación automática con metadatos\n' +
      '- ✅ Búsqueda insensible a mayúsculas/minúsculas\n' +
      '- ✅ Filtros combinables (AND lógico)\n' +
      '- ✅ Resumen de filtros aplicados en respuesta\n' +
      '- ✅ Incluye datos de huésped y habitación\n\n' +
      '**Patrón de diseño:** Query Builder para construcción dinámica de consultas',
  })
  @ApiQuery({
    name: 'fechaInicioDesde',
    required: false,
    description: 'Fecha de inicio desde (ISO)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'fechaInicioHasta',
    required: false,
    description: 'Fecha de inicio hasta (ISO)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'checkInDesde',
    required: false,
    description: 'Check-in desde (ISO)',
    example: '2024-01-15T14:00:00.000Z',
  })
  @ApiQuery({
    name: 'checkInHasta',
    required: false,
    description: 'Check-in hasta (ISO)',
    example: '2024-01-20T12:00:00.000Z',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Estado de la reserva',
    enum: ['RESERVADO', 'CANCELADO', 'FINALIZADO', 'PENDIENTE'],
  })
  @ApiQuery({
    name: 'paisProcedencia',
    required: false,
    description: 'País de procedencia (búsqueda parcial)',
    example: 'Colombia',
  })
  @ApiQuery({
    name: 'ciudadProcedencia',
    required: false,
    description: 'Ciudad de procedencia (búsqueda parcial)',
    example: 'Medellín',
  })
  @ApiQuery({
    name: 'motivoViaje',
    required: false,
    description: 'Motivo del viaje',
    enum: [
      'NEGOCIOS_Y_MOTIVOS_PROFESIONALES',
      'VACACIONES_RECREO_Y_OCIO',
      'VISITAS_A_FAMILIARES_Y_AMIGOS',
      'EDUCACION_Y_FORMACION',
      'SALUD_Y_ATENCION_MEDICA',
      'RELIGION_Y_PEREGRINACIONES',
      'COMPRAS',
      'TRANSITO',
      'OTROS_MOTIVOS',
    ],
  })
  @ApiQuery({
    name: 'habitacionId',
    required: false,
    description: 'ID de la habitación',
    type: Number,
    example: 101,
  })
  @ApiQuery({
    name: 'huespedId',
    required: false,
    description: 'ID del huésped principal',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'costoMinimo',
    required: false,
    description: 'Costo mínimo de la reserva',
    type: Number,
    example: 100.0,
  })
  @ApiQuery({
    name: 'costoMaximo',
    required: false,
    description: 'Costo máximo de la reserva',
    type: Number,
    example: 1000.0,
  })
  @ApiQuery({
    name: 'acompaniantesMinimo',
    required: false,
    description: 'Número mínimo de acompañantes',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'acompaniantesMaximo',
    required: false,
    description: 'Número máximo de acompañantes',
    type: Number,
    example: 5,
  })
  @ApiQuery({
    name: 'ordenarPor',
    required: false,
    description: 'Campo por el que ordenar',
    enum: [
      'fecha_inicio',
      'fecha_fin',
      'check_in',
      'check_out',
      'costo',
      'createdAt',
    ],
    example: 'fecha_inicio',
  })
  @ApiQuery({
    name: 'direccionOrden',
    required: false,
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'busquedaTexto',
    required: false,
    description: 'Búsqueda libre en nombres, apellidos o documento',
    example: 'Juan Pérez',
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse({
    status: 200,
    description: 'Reservas encontradas con filtros aplicados',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Reserva' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalReservas: { type: 'number', example: 25 },
            lastPage: { type: 'number', example: 3 },
            filtrosAplicados: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 3 },
                filtros: {
                  type: 'object',
                  example: {
                    estado: 'RESERVADO',
                    paisProcedencia: 'Colombia',
                    costoMinimo: 100,
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({
    status: 400,
    description: 'Filtros de entrada inválidos o formato de fecha incorrecto',
  })
  buscarConFiltros(@Query() filtros: FiltrosReservaDto) {
    return this.reservasService.buscarConFiltros(filtros);
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
