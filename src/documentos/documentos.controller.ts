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

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentosService.create(createDocumentoDto);
  }

  @Get(':huespedId')
  findAll(
    @Param('huespedId', ParseIntPipe) huespedId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.documentosService.findAll(huespedId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
  ) {
    return this.documentosService.update(+id, updateDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentosService.remove(+id);
  }
}
