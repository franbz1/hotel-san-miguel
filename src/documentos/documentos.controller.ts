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
} from '@nestjs/swagger';
import { Documento } from './entities/documento.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';

@ApiTags('documentos')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO)
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
    description: 'Documento creado exitosamente',
    type: Documento,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
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
  @ApiParam({
    name: 'huespedId',
    description: 'ID del huésped',
    type: Number,
    example: 1,
  })
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
    description: 'Lista de documentos obtenida exitosamente',
    type: [Documento],
  })
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
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
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
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
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.remove(id);
  }
}
