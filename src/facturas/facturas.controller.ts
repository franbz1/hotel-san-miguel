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
  ApiExtraModels,
} from '@nestjs/swagger';
import { Factura } from './entities/factura.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('facturas')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(Factura)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  // ================================================================
  // CREATE - Crear nueva factura
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear una nueva factura' })
  @ApiBody({ type: CreateFacturaDto })
  @ApiResponse({
    status: 201,
    description: 'Factura creada exitosamente',
    type: Factura,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  // ================================================================
  // READ - Listar todas las facturas (con paginación)
  // ================================================================
  @Get()
  @ApiOperation({ summary: 'Listar todas las facturas con paginación' })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(createPaginatedApiResponse(Factura, 'totalFacturas'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.facturasService.findAll(paginationDto);
  }

  // ================================================================
  // READ - Buscar factura por ID
  // ================================================================
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
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar factura por ID
  // ================================================================
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
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacturaDto: UpdateFacturaDto,
  ) {
    return this.facturasService.update(id, updateFacturaDto);
  }

  // ================================================================
  // DELETE - Eliminar factura por ID (soft delete)
  // ================================================================
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
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.remove(id);
  }
}
