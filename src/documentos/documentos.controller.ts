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
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
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
import { Documento } from './entities/documento.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('documentos')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(Documento)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  // ================================================================
  // CREATE - Crear nuevo documento
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo documento' })
  @ApiBody({ type: CreateDocumentoDto })
  @ApiResponse({
    status: 201,
    description: 'Documento creado exitosamente',
    type: Documento,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({
    status: 404,
    description: 'Huésped o huésped secundario no encontrado',
  })
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentosService.create(createDocumentoDto);
  }

  // ================================================================
  // READ - Buscar documentos por ID de huésped (con paginación)
  // ================================================================
  @Get('huesped/:huespedId')
  @ApiOperation({ summary: 'Buscar documentos por ID de huésped' })
  @ApiParam({
    name: 'huespedId',
    description: 'ID del huésped',
    type: Number,
    example: 1,
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(
    createPaginatedApiResponse(
      Documento,
      'total',
      'Lista paginada de documentos del huésped con metadatos',
    ),
  )
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(
    @Param('huespedId', ParseIntPipe) huespedId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.documentosService.findAll(huespedId, paginationDto);
  }

  // ================================================================
  // READ - Buscar documento por ID
  // ================================================================
  @Get(':id')
  @ApiOperation({ summary: 'Buscar un documento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del documento',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Documento encontrado',
    type: Documento,
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar documento por ID
  // ================================================================
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un documento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del documento',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateDocumentoDto })
  @ApiResponse({
    status: 200,
    description: 'Documento actualizado exitosamente',
    type: Documento,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
  ) {
    return this.documentosService.update(id, updateDocumentoDto);
  }

  // ================================================================
  // DELETE - Eliminar documento por ID
  // ================================================================
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento por ID (hard delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del documento',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
    type: Documento,
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.remove(id);
  }
}
