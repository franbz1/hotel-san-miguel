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
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
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
import { Factura } from './entities/factura.entity'; // Importa la entidad Factura

@ApiTags('facturas') // Agrupa las rutas
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO) // Roles autorizados
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva factura' })
  @ApiBody({ type: CreateFacturaDto })
  @ApiResponse({
    status: 201,
    description: 'Factura creada exitosamente',
    type: Factura,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las facturas con paginación' })
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
    description: 'Lista de facturas obtenida exitosamente',
    type: [Factura],
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.facturasService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una factura por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la factura',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Factura encontrada',
    type: Factura,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una factura por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la factura',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateFacturaDto })
  @ApiResponse({
    status: 200,
    description: 'Factura actualizada exitosamente',
    type: Factura,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacturaDto: UpdateFacturaDto,
  ) {
    return this.facturasService.update(id, updateFacturaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una factura por ID (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la factura',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Factura eliminada exitosamente',
    type: Factura,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.remove(id);
  }
}
