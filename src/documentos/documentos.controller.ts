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
  UseGuards,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.remove(id);
  }
}
