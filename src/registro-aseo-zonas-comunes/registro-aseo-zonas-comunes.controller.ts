import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistroAseoZonasComunesService } from './registro-aseo-zonas-comunes.service';
import { CreateRegistroAseoZonasComuneDto } from './dto/create-registro-aseo-zonas-comune.dto';
import { UpdateRegistroAseoZonasComuneDto } from './dto/update-registro-aseo-zonas-comune.dto';

@Controller('registro-aseo-zonas-comunes')
export class RegistroAseoZonasComunesController {
  constructor(private readonly registroAseoZonasComunesService: RegistroAseoZonasComunesService) {}

  @Post()
  create(@Body() createRegistroAseoZonasComuneDto: CreateRegistroAseoZonasComuneDto) {
    return this.registroAseoZonasComunesService.create(createRegistroAseoZonasComuneDto);
  }

  @Get()
  findAll() {
    return this.registroAseoZonasComunesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroAseoZonasComunesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistroAseoZonasComuneDto: UpdateRegistroAseoZonasComuneDto) {
    return this.registroAseoZonasComunesService.update(+id, updateRegistroAseoZonasComuneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroAseoZonasComunesService.remove(+id);
  }
}
