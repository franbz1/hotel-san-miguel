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
import { HuespedesService } from './huespedes.service';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedeDto } from './dto/update-huespede.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';

@Controller('huespedes')
export class HuespedesController {
  constructor(private readonly huespedesService: HuespedesService) {}

  @Post()
  create(@Body() CreateHuespedDto: CreateHuespedDto) {
    return this.huespedesService.create(CreateHuespedDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.findOne(id);
  }

  @Get('documento/:documentoId')
  findByDocumentoId(@Param('documentoId') documentoId: string) {
    return this.huespedesService.findByDocumentoId(documentoId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHuespedeDto: UpdateHuespedeDto,
  ) {
    return this.huespedesService.update(+id, updateHuespedeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.remove(id);
  }
}
