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
} from '@nestjs/swagger';
import { Documento } from './entities/documento.entity';

@ApiTags('documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  /**
   * Crea un nuevo documento.
   * `POST /documentos`
   * @param createDocumentoDto Datos del documento a crear.
   * @returns El documento creado.
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo documento' })
  @ApiBody({ type: CreateDocumentoDto })
  @ApiResponse({
    status: 201,
    description: 'Documento creado',
    type: Documento,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentosService.create(createDocumentoDto);
  }

  /**
   * Busca todos los documentos por el id del huesped
   * `GET /documentos/huesped/:huespedId`
   * @param huespedId ID del huesped.
   * @param paginationDto Datos de paginación.
   * @returns Documentos[] con los documentos y metadatos de paginación.
   */
  @Get('huesped/:huespedId')
  @ApiOperation({ summary: 'Buscar documentos por ID de huésped' })
  @ApiParam({ name: 'huespedId', description: 'ID del huésped', type: Number })
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
    description: 'Lista de documentos',
    type: [Documento],
  })
  findAll(
    @Param('huespedId', ParseIntPipe) huespedId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.documentosService.findAll(huespedId, paginationDto);
  }

  /**
   * Busca un documento por su ID.
   * `GET /documentos/:id`
   * @param id ID del documento.
   * @returns El documento encontrado.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar un documento por ID' })
  @ApiParam({ name: 'id', description: 'ID del documento', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Documento encontrado',
    type: Documento,
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.findOne(id);
  }

  /**
   * Actualiza los datos de un documento por su ID.
   * `PATCH /documentos/:id`
   * @param id ID del documento.
   * @param updateDocumentoDto Datos para actualizar.
   * @returns El documento actualizado.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un documento por ID' })
  @ApiParam({ name: 'id', description: 'ID del documento', type: Number })
  @ApiBody({ type: UpdateDocumentoDto })
  @ApiResponse({
    status: 200,
    description: 'Documento actualizado',
    type: Documento,
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
  ) {
    return this.documentosService.update(id, updateDocumentoDto);
  }

  /**
   * Elimina un documento por su ID.
   * `DELETE /documentos/:id`
   * @param id ID del documento.
   * @returns El documento eliminado.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento por ID' })
  @ApiParam({ name: 'id', description: 'ID del documento', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado',
    type: Documento,
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.remove(id);
  }
}
